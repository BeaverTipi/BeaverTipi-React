/*
[React: ProceedingContracts]
  └─ checkSignStatus
  └─ authorize (인가 성공 시)
      └─ encrypt(contId)
      └─ window.location.href = /contract/{encId}

[React: ContractSignature.jsx]
  └─ useParams → decrypt(encId)
  └─ localStorage.getItem(contId)
  └─ render UI (PDF, WS, Sign UI)

[SignatureCanvas] "서명 완료" 클릭 → handleComplete()
  ↓
[ContractSignature]
  onSignatureComplete({ base64, signerInfo })
    ├─ 1. hash 생성
    ├─ 2. PDF에 서명 삽입 (insertSignatureToPDF)
    ├─ 3. DB 저장 (handleSignatureImageToServer)
    ├─ 4. WebSocket 전파 (onSigned)
    └─ 5. PDF Viewer 강제 갱신 (setRefreshCount)

[SignatureCanvas] "서명 거절" 클릭 ← 예: 임차인이 계약 내용 불만족
  ↓
[ContractSignature]
1. "서명 거절" 버튼 클릭
2. confirm() → 진짜 거절할래?
3. WebSocket으로 "REJECTED:<contId>:<role>" 전송
4. 모든 사용자에게 실시간 전파
5. SignatureStatusBoard에 "거절됨" 표시
6. 임시 서명 PDF 삭제 (선택)
7. 서명페이지 자동 종료 or 비활성화


[마지막 서명자 완료]
  ↓
state.signers 업데이트됨
  ↓
useEffect → isAllSigned 체크
  ↓
contract 확정 API 호출
  ↓
WebSocket: "COMPLETED:<contId>"
  ↓
모든 사용자 알림 → 페이지 전환


signerInfo: {
  mbrId: string;     // 프론트/DB 식별자
  role: "LESSOR" | "LESSEE" | "AGENT"
  name: string;
  telno: string;
  ipAddr: string;    // 접속 IP (인가 시)
  signedAt: string | null;
  hashVal: string | null;
🔹 상태 관리 / UI 표시 용도
🔹 필드명은 camelCase
🔹 내부적으로만 사용
};

type ContractSignDTO = {
  contId: string;                 // 계약 ID
  contDtSignType: string;         // 역할 (AGENT, LESSOR, ...)
  contDtSignStat: "SIGNED";       // 고정값
  contDtSignDtm: string;          // ISO datetime (서명시각)
  contDtSignHashVal: string;      // hash(base64 + mbrId + contId + role + signedAt)
  contDtBaseData: string;         // base64 image
  contDtIpAddr: string;           // IP 주소
  mbrCd: string;                  // 서명자 코드 (mbrId)
};
🔸 백엔드 DTO 기준
🔸 명확한 prefix (contDt) 존재
🔸 일부 필드는 signerInfo와 이름이 다름 (ex. mbrCd vs mbrId)
*/


// ⚠️ 아래는 signers의 구조를 문서화하기 위한 선언입니다.
//     실제 값은 서버에서 받아오며, 이 구조에 맞게 렌더링됩니다.

import React, { useEffect, useReducer, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import Swal from "sweetalert2";
import { useSecureAxios } from "../hooks/useSecureAxios";
import { useDomain } from "../hooks/useDomain";
import SignatureCanvas from "../components/myOfficeContract/ContractSignature/SignatureCanvas";
import { useAES256 } from "../hooks/useAES256";
import { useSecureAxiosFactory } from "../hooks/useSecureAxiosFactory";
import SignaturePDFViewer from "../components/myOfficeContract/ContractSignature/SignaturePDFViewer";
import SignatureStatusBoard from "../components/myOfficeContract/ContractSignature/SignatureStatusBoard";
import { useSignatureHash } from "../hooks/useSignatureHash";
import { insertSignatureToPDF } from "../worker/insertSignatureToPDF";
import { uploadSignedPDFToS3 } from "../worker/uploadSignedPDFToS3";
import { uploadSignedPDFTemporarily } from "../worker/uploadSignedPDFTemporarily";

// [명시적인 기본 구조 선언]
const MSG = {
  U_NOT_JOINED: "NOT_JOINED",
  U_JOINED: "JOINED",
  U_SIGNED: "SIGNED",
  U_REJECTED: "REJECTED",
  U_DISCONNECTED: "DISCONNECTED",
  P_EXPIRED: "EXPIRED",
  SET_ERROR: "ERROR",
  SET_LOADING: "LOADING",
};
const ROLE = {
  LESSEE: "LESSEE",
  LESSOR: "LESSOR",
  AGENT: "AGENT"
}
const initialState = {
  LESSEE: {
    status: MSG.NOT_JOINED,
    role: ROLE.LESSEE,
    mbrCd: null,
    mbrNm: null,
    telno: null,
    signedAt: null,
    hashVal: null,
    isValid: null,
    ipAddr: null,
    contId: location.state?.contId || localStorage.getItem("ACTIVE_SIGN_CONTID") || "",
  },
  LESSOR: {
    status: MSG.NOT_JOINED,
    role: ROLE.LESSOR,
    mbrCd: null,
    mbrNm: null,
    telno: null,
    signedAt: null,
    hashVal: null,
    isValid: null,
    ipAddr: null,
    contId: location.state?.contId || localStorage.getItem("ACTIVE_SIGN_CONTID") || "",
  },
  AGENT: {
    status: MSG.NOT_JOINED,
    role: ROLE.AGENT,
    mbrCd: null,
    mbrNm: null,
    telno: null,
    signedAt: null,
    hashVal: null,
    isValid: null,
    ipAddr: null,
    contId: location.state?.contId || localStorage.getItem("ACTIVE_SIGN_CONTID") || "",
  }
};

export default function ContractSignature() {
  const { encryptedContId } = useParams();// 암호화된 ID ← URL 파라미터
  const navigate = useNavigate();
  const location = useLocation();
  const createSecureAxios = useSecureAxiosFactory();
  const authAxios = createSecureAxios("/rest/contract");
  const wsRef = useRef(null); // ✅ WebSocket 참조
  const { decryptWithAES256 } = useAES256(); // ← 이게 있는지 확인
  const [refreshCount, setRefreshCount] = useState(Date.now());
  const createHash = useSignatureHash();
  const [refreshPdfUrl, setRefreshPdfUrl] = useState(null);
  const { SPRING_URL_ORIGIN, SPRING_URL_PREFIX, HOSTNAME } = useDomain();
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";

  const contId = useParams();
  const handleSignComplete = () => {
    setRefreshCount(Date.now()); // PDF 강제 갱신
  };

  const [myRole, setMyRole] = useState();
  const [state, dispatch] = useReducer(reducer, initialState);
  function reducer(state, action) {
    const { role } = action;

    switch (action.type) {
      case MSG.U_NOT_JOINED:
        return { ...state, [role]: { ...state[role] } };
      case MSG.U_JOINED: {
        const { role, name, mbrCd, telno, ipAddr } = action.payload;
        return { ...state, [role]: { ...state[role], status: MSG.U_JOINED, role, name, mbrCd, telno, ipAddr } };
      }
      case MSG.U_SIGNED:
        return { ...state, [role]: { ...state[role], status: MSG.U_SIGNED, ...action.payload } };
      case MSG.U_REJECTED:
        return { ...state, [role]: { ...state[role], status: MSG.U_REJECTED, ...action.payload } };
      case MSG.U_DISCONNECTED:
        return { ...state, [role]: { ...state[role], status: MSG.U_DISCONNECTED, ...action.payload } };
      default:
        return state;
    }
  }
  // useEffect(() => {
  //   console.log("📦 현재 상태.signers", state.signers);
  // }, [state.signers]);
  // ✅ 인가 처리
  useEffect(() => {
    console.log("encryptedContId", encryptedContId)
    if (encryptedContId) {
      (async () => {
        try {
          const data = await authAxios.post("authorize", {
            encryptedContId,
            _method: "GET",
          });
          // console.log("🔐 [useEffect] 인가 조건 체크", {
          //   encryptedContId,
          //   currentContId: state.contId,
          //   data
          // });
          if (!data.success) {
            Swal.fire("접근 불가", data.message, "info");
            navigate("/signin");
          } else {
            localStorage.setItem("ACTIVE_SIGN_CONTID", data.contId);
            const joined_payload = {
              payload: {
                role: data.role,
                status: MSG.U_JOINED,
                mbrCd: data.mbrCd,
                mbrId: data.mbrId,
                name: data.name,
                telno: data.telno,
                hashVal: null,
                isValid: null,
                signedAt: null,
                ipAddr: data.ipAddr,
              }
            }
            dispatch({
              type: MSG.U_JOINED,
              payload: joined_payload,
            });
            setMyRole(data.role);
            wsRef.current.send(
              `${MSG.U_JOINED}:${contId}:${JSON.stringify(joined_payload)}`
            );
          }
        } catch (err) {
          dispatch({ type: MSG.SET_ERROR, payload: err });
          Swal.fire("오류", "접근 실패", "error");
          navigate("/");
        } finally {
          dispatch({ type: MSG.SET_LOADING, payload: false });
        }
      })();
    } else {
      dispatch({ type: MSG.SET_LOADING, payload: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encryptedContId]);

  useEffect(() => {
    if (contId) localStorage.setItem("ACTIVE_SIGN_CONTID", contId);
  }, [contId, myRole]);


  /*##################################################################################*/
  /** WebSocket Handler **/
  //서명페이지 유효 시간 만료 상태 전파
  useEffect(() => {
    const socket = new WebSocket(`${protocol}://${HOSTNAME}/ws/contractExpire`);

    socket.onmessage = (event) => {
      const msg = event.data;
      if (msg.startsWith(MSG.P_EXPIRED)) {
        const expiredContId = msg.split(":")[1];

        if (expiredContId === contId) {
          Swal.fire({
            icon: "info",
            title: "서명 만료",
            text: "전자서명의 유효 시간이 만료되었습니다.",
            confirmButtonColor: "#085D89", // sky-800
          }).then(() => {
            if (window.history.length > 1) navigate(-1);
            else navigate("/");
          });
        }
      }
    };
    socket.onerror = (err) => console.error("❌ [SIGNPAGE] WebSocket 에러", err);
    socket.onclose = () => console.log("🔌 [SIGNPAGE] WebSocket 연결 종료");
    return () => socket.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contId]); // 현재 계약 ID를 상태로 두고 비교

  // 메시지 수신
  useEffect(() => {
    if (!contId || !myRole) return;
    //WebSocket "연결 시도" 의미상 정확>> "handshake 시도" 기술적>> "인스턴스 생성" soso
    const ws = new WebSocket(`${protocol}://${HOSTNAME}/ws/signers?contId=${contId}&role=${signerRole}`);
    wsRef.current = ws;

    ws.onopen = () => ws.send(`${MSG.P_OPENED}:${contId}:${myRole}`);

    ws.onmessage = event => {
      const message = event.data;
      console.log("📨 받은 메시지:", message);

      //---JOINED
      if (message.startsWith(MSG.U_JOINED)) {
        const [type, msgContId, role] = message.split(/:(.+?):/);
        let payload = null;
        if (msgContId === contId)
          dispatch({
            type: MSG.U_JOINED,
            payload: {
              role: data.role,
              mbrNm: mbrNm,

            }
          });
      }

      //---SIGNED
      if (message.startsWith(MSG.U_SIGNED)) {
        const [type, msgContId, role] = message.split(/:(.+?):/);
        let payload = null;
        if (msgContId === contId) {
          dispatch({
            type: MSG.U_SIGNED,
            payload: {
              ...state,
              [role.toLowerCase()]: MSG.U_SIGNED,
            },
          });
        }
      }

      //---REJECTED
      if (message.startsWith(MSG.U_REJECTED)) {
        const [type, msgContId, role] = message.split(/:(.+?):/);
        let payload = null;
        if (msgContId === contId) {
          dispatch({
            type: MSG.U_REJECTED,
            payload: state.signers.map(s =>
              s.role === role ? { ...s, isRejected: true } : s
            ),
          });
          Swal.fire({
            icon: "error",
            title: "계약 거절됨",
            text: `${role} 사용자가 계약을 거절했습니다.`,
            confirmButtonColor: "#d33",
          }).then(() => {
            navigate("/");
          });
        }
      }

      //---DISCONNECTED
      if (message.startsWith(MSG.U_DISCONNECTED)) {
        const [type, msgContId, role] = message.split(/:(.+?):/);
        let payload = null;
        if (msgContId === contId) {
          Swal.fire({
            icon: "success",
            title: "계약 확정됨",
            text: "모든 서명이 완료되어 계약이 확정되었습니다.",
            confirmButtonColor: "#0d9488",
          }).then(() => {
            navigate("/contract/proceeding"); // 또는 계약 상세 페이지
          });
        }
      }

    };

    ws.onerror = (err) => console.error("❌ WebSocket 오류:", err);
    ws.onclose = () => console.log("🔌 WebSocket 종료");

    return () => ws.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contId]);


  /*
  [실시간 전파 전용]
  "SIGNED:<contId>:<role>"를 WS로 broadcast하고, reducer로 local 상태 갱신
    -WebSocket 전파용 메시지 전송
    -내부 state.signatureStatus 갱신
    -signerInfo.signedAt 값만 상태로 갱신
  =>SignatureCanvas 컴포넌트로 이식
  */
  const onSigned = (role) => {
    const now = new Date().toISOString();

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)
      wsRef.current.send(`SIGNED:${contId}:${role}`);

    // 상태 갱신
    dispatch({
      type: "SET_SIGNATURE_STATUS",
      payload: {
        ...state.signatureStatus,
        [role.toLowerCase()]: "SIGNED",
      },
    });

    // 서명 시각 기록
    dispatch({ type: "SET_SIGNED_AT", payload: now });
  };


  /*
  [서버 제출용]
  전자서명 이미지 및 메타데이터를 서버에 저장
  -계약 ID와 signerInfo를 기반으로 서버에 DB 등록용 DTO(payload) 전송
  -여기서 hashVal, signedAt, ipAddr, base64 등을 함께 서버에 전달함
  */
  async function handleSignatureImageToServer({ contId, base64Image, signerInfo }) {
    console.log("📦 서버 전송 signerInfo = ", signerInfo);
    console.log("📦 hashVal = ", signerInfo.hashVal);
    if (!signerInfo.hashVal) {
      console.warn("⚠️ 해시값 누락으로 업로드 실패 가능성 있음");
    }
    const payload = {
      contractDigitalSign: {
        contId,
        contDtSignType: signerInfo.role,
        contDtSignDtm: signerInfo.signedAt,
        contDtSignHashVal: signerInfo.hashVal,
        contDtSignStat: "SIGNED",
        contDtBaseData: base64Image,
        contDtIpAddr: signerInfo.ipAddr,
        mbrCd: signerInfo.mbrId,
      },
      _method: "POST",
    }

    try {
      const response = await authAxios.post("signature/upload", payload);
      if (response.success) console.log("✅ 서명 이미지 업로드 성공");
      else console.warn("⚠️ 업로드 실패:", response.message);
    } catch (err) {
      console.error("❌ 서명 업로드 오류:", err);
    }
  }

  /*
  [실시간 감시/조회용]
  누가 서명했고 위조는 아닌지 주기적으로 판단
  -서명 상태 및 해시 검증 결과 조회
  -signature/status API로부터 서명자 목록 & hash 검증 결과를 가져옴
  -isValid 포함된 signers 배열을 reducer에 저장
  */
  useEffect(() => {
    if (!contId) return;

    const fetchSignatureStatus = async () => {
      try {
        const response = await authAxios.post("signature/status", {
          contId,
          _method: "GET", // 백엔드에서 이걸 기준으로 GET 동작함
        });
        console.log("🛰 contId for status check", contId); // 🔥 반드시 찍어봐야 함
        console.log("✅ signers from server", response.signers);
        if (response.success) {
          const validatedSigners = response.signers.map((signer) => {
            const { base64, mbrCd, mbrNm, signedAt, contDtSignType, contDtSignHashVal, contDtSignDtm } = signer;

            const expectedHash = createHash({
              base64Image: base64,
              mbrCd,
              contId,
              role: contDtSignType,
              signedAt: contDtSignDtm,
            });

            return {
              role: contDtSignType,
              name: mbrNm, // 또는 user name이 있을 경우 사용
              connected: false, // 이후 WebSocket에서 업데이트됨
              signedAt: contDtSignDtm,
              isValid: contDtSignDtm ? expectedHash === contDtSignHashVal : undefined,
              isRejected: signer.isRejected ?? false,
              tempPdfUrl: signer.tempPdfUrl ?? null,
            };
          });

          dispatch({ type: "SET_SIGNERS", payload: validatedSigners });
          console.log("✅ 서명 상태 로딩 완료:", validatedSigners);
          console.log("✅ reducer 전달 직전 payload 길이:", validatedSigners.length);
        }
      } catch (err) {
        console.error("❌ 서명 상태 조회 오류", err);
      }
    };

    fetchSignatureStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contId]);


  /*
  계약서 메타 정보 로딩 (ex. 계약서 제목, 작성일, 서명자 목록, 해시값 등)
  */
  useEffect(() => {
    if (!contId) return;
    (async () => {
      try {
        const response = await authAxios.post("pdf/meta", {
          contId,
          _method: "GET",
        });
        dispatch({ type: "SET_PDF_DATA", payload: response });
      } catch (err) {
        console.error("❌ 계약 PDF 정보 로딩 실패", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contId]);

  // /*
  // PDF 원본 자체(blob)를 불러오는 함수
  // -insertSignatureToPDF()에 넘기기 위한 originalPdfBytes를 생성
  // */
  // const getOriginalPdf = async (contId) => {
  //   const encryptedRes = await authAxios.post("pdf/base64", {
  //     contId,
  //     _method: "GET",
  //   });

  //   const base64 = encryptedRes.base64; // 서버에서 받은 PDF base64
  //   const binary = atob(base64);
  //   const len = binary.length;
  //   const bytes = new Uint8Array(len);

  //   for (let i = 0; i < len; i++) {
  //     bytes[i] = binary.charCodeAt(i);
  //   }

  //   return bytes.buffer; // ← insertSignatureToPDF(originalBytes) 에 넘겨줄 수 있음
  // };

  /*
  1. hash 생성
  2. 원본 PDF fetch
  3. insertSignatureToPDF
  4. S3서버에 '나'의 서명본 업로드
    - DB 저장하기 전 롤백 가능성 염두
  5. DB 저장
  6. WebSocket 전파
  7. PDF Viewer 리프레시
  0. 서명 거부 or 서명페이지 종료 시 deleteTempSignedPdf(contId, role) 호출
  */
  const handleSignatureComplete = async ({ dataUrl, signerInfo }) => {
    const hashVal = createHash({
      base64Image: dataUrl,
      telno: signerInfo.telno,
      contId,
      role: signerInfo.role,
      signedAt: signerInfo.signedAt,
    });
    console.log("hashVal 생성한당 ^0^^0^^0^^)^", dataUrl, signerInfo.telno, contId, signerInfo.role, signerInfo.signedAt);
    const completeInfo = { ...signerInfo, hashVal };

    try {
      //     const originalBytes = await getOriginalPdf(contId);
      //     const signedPdfBlob = await insertSignatureToPDF(dataUrl, completeInfo, originalBytes);

      //     if (!signedPdfBlob) throw new Error("PDF 서명 삽입 실패");

      // // blob → base64 변환
      // const blobToBase64 = (blob) =>
      //   new Promise((resolve, reject) => {
      //     const reader = new FileReader();
      //     reader.onloadend = () => {
      //       const base64 = reader.result.split(",")[1];
      //       resolve(base64);
      //     };
      //     reader.onerror = reject;
      //     reader.readAsDataURL(blob);
      //   });
      //     const base64 = await blobToBase64(signedPdfBlob);

      //       // 서버로 전송할 payload 구성
      const payload = {
        _method: "POST",
        contractDigitalSign: {
          contId,
          contDtSignId: null,
          contDtSignType: signerInfo.role,
          contDtBaseData: dataUrl,
          contDtSignDtm: signerInfo.signedAt,
          contDtSignHashVal: hashVal,
          mbrCd: localStorage.getItem("mbrCd") || "TEMP",
          contDtSignStat: "N",
        },
      };
      const data = await authAxios.post("signature/upload", payload);
      if (!data?.success || !data?.fileUrl) {
        throw new Error("임시 서명 PDF 업로드 실패");
      }
      const tempFileUrl = data.fileUrl;

      // WebSocket으로 전파 (SIGNED_TEMP)
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)
        wsRef.current.send(`SIGNED_TEMP:${contId}:${signerInfo.role}:${tempFileUrl}`);

      await handleSignatureImageToServer({
        contId,
        base64Image: dataUrl,
        signerInfo: completeInfo,
      });

      onSigned(completeInfo.role);
      handleSignComplete();
      Swal.fire("서명 완료", "계약서에 서명을 성공적으로 등록했습니다.", "info");
    } catch (err) {
      console.error("❌ 서명 완료 처리 중 오류 발생", err);
      Swal.fire("오류", "서명 완료 처리에 실패했습니다.", "error");
    }
  };


  const handleReject = async () => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "서명을 거절하시겠습니까?",
      text: "거절 시 계약은 무효화되며, 서명페이지는 종료됩니다.",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "거절하기",
      cancelButtonText: "취소",
    });

    if (confirmed.isConfirmed) {
      try {
        // ✅ 1. WebSocket 거절 전파
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(`REJECTED:${contId}:${state.signerInfo.role}`);
        }

        // ✅ 2. 임시 PDF 삭제
        await deleteTempSignedPdf(contId, state.signerInfo.role);

        // ✅ 3. 서명페이지 종료
        Swal.fire("거절 완료", "서명 절차를 종료합니다.", "info").then(() => {
          navigate("/"); // 또는 계약 목록으로 리디렉션
        });
      } catch (err) {
        console.error("❌ 서명 거절 처리 실패", err);
        Swal.fire("오류", "서명 거절 중 오류가 발생했습니다.", "error");
      }
    }
  };


  const isAllSigned = signers => {
    return signers.every(s => s.signedAt && !s.isRejected);
  };

  useEffect(() => {
    console.log("👤 signerInfo 상태", state.signerInfo);

    if (!contId || !state.signers || state.signers.length === 0) return;

    // ✅ 전부 서명됐는지 확인
    if (isAllSigned(state.signers)) completeContract(contId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.signerInfo]);

  const completeContract = async (contId) => {
    try {
      const response = await authAxios.post("signature/complete", {
        contId,
        _method: "PUT",
      });

      if (response.success) {
        console.log("🎉 계약 확정 완료");

        // ✅ WebSocket 전파
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(`COMPLETED:${contId}`);
        }

        // ✅ UI 알림
        Swal.fire({
          icon: "success",
          title: "계약 완료",
          text: "모든 서명이 완료되어 계약이 확정되었습니다.",
          confirmButtonColor: "#0d9488", // teal-600
        }).then(() => {
          navigate("/contract/proceeding");
        });

      } else {
        console.warn("⚠️ 계약 확정 실패:", response.message);
      }
    } catch (err) {
      console.error("❌ 계약 확정 요청 실패", err);
    }
  };
  useEffect(() => {
    console.log("✅ encryptedContId = ", encryptedContId);
    console.log("✅ authorized contId = ", state.contId);
  }, [encryptedContId, state.contId]);
  /*##################################################################################*/
  /** PAGE RENDERER **/
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>에러가 발생했습니다: {error.message || "알 수 없는 오류"}</p>
      </div>
    );
  }
  if (!contId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-yellow-500 bg-gray-900">
        <p className="text-lg">계약 ID가 유효하지 않습니다.</p>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <svg
          className="animate-spin h-10 w-10 text-white mb-4"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="white"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="white"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
          />
        </svg>
        <p className="text-lg">계약 정보를 불러오는 중입니다...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white p-6 space-y-6">
      <h1 className="text-2xl font-semibold">전자계약 서명 {contId}</h1>

      {/* 계약 주요정보 요약 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* 좌측: PDF 미리보기 */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md overflow-auto max-h-[75vh]">
          <h2 className="text-lg font-semibold mb-4">계약서 미리보기</h2>
          <SignaturePDFViewer
            contId={contId}
            refreshKey={refreshCount}
            overrideUrl={refreshPdfUrl}
          />
        </div>

        {/* 우측: 서명판 + 상태표시 */}
        <div className="flex flex-col gap-6">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">서명 상태</h2>
            <SignatureStatusBoard
              signers={state.signers}
              onPreview={(fileUrl) => setRefreshPdfUrl(fileUrl)} />
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">서명하기</h2>
            <SignatureCanvas
              signerInfo={state}
              onSignatureComplete={handleSignatureComplete}
              onSign={role => onSigned(role)}
              onSignComplete={handleSignComplete}
              onReject={handleReject} />
          </div>
        </div>
      </div>
    </div>
  );
}
