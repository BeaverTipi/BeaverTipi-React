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

[WebSocket Message 구조]
`<U_JOINED>:<contId>:<role>:<payload>`


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

//#################### import ####################
import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import Swal from "sweetalert2";
import { useSecureAxiosFactory } from "../hooks/useSecureAxiosFactory";
import { useDomain } from "../hooks/useDomain";
import SignatureCanvas from "../components/myOfficeContract/ContractSignature/SignatureCanvas";
import SignaturePDFViewer from "../components/myOfficeContract/ContractSignature/SignaturePDFViewer";
import SignatureStatusBoard from "../components/myOfficeContract/ContractSignature/SignatureStatusBoard";
import { useSignatureHash } from "../hooks/useSignatureHash";
import {
  contractSignatureReducer,
  initialSignatureState,
} from "../reducers/contractSignatureReducer";
import { useAES256 } from "../hooks/useAES256";

// [명시적인 기본 구조 선언]
//#################### ENUM ####################
const MSG = {
  //USER EVENT
  U_NOT_JOINED: "NOT_JOINED",
  U_JOINED: "JOINED",
  U_SIGNED: "SIGNED",
  U_REJECTED: "REJECTED",
  U_DISCONNECTED: "DISCONNECTED",
  //PROCESS
  P_EXPIRED: "EXPIRED",
  P_SIGNED_TEMP1: "SIGNED_TEMP1",
  P_SIGNED_TEMP2: "SIGNED_TEMP2",
  P_ALL_SIGNED: "ALL_SIGNED",
  //REDUCER_SETTING
  SET_ERROR: "ERROR",
  SET_LOADING: "LOADING",
  SET_SIGNERS: "SIGNERS",
  SET_SIGNER_INFO: "SIGNER_INFO",
  SET_SIGNED_AT: "SIGNED_AT",
  SET_SIGNATURE_STATUS: "SIGNATURE_STATUS",
  SET_TEMP_PDF_URL: "TEMP_PDF_URL",
  SET_TEMP_PDF_FILE_IDS: "TEMP_PDF_FILE_ID",
  SET_PDF_DATA: "PDF_DATA",
  SET_CONT_ID: "CONT_ID",
  SET_INIT_RESPONSE: "INIT_RESPONSE",
};
//메시지 페이로드 온전히 유지하기 위한 유틸함수.
function splitWithLimit(str, delimiter, limit) {
  const parts = str.split(delimiter);
  const head = parts.slice(0, limit);
  const tail = parts.slice(limit).join(delimiter);
  console.log(
    "splitWithLimit 함수로 메시지 분석:: ",
    "\n parts::",
    parts,
    "\n head",
    head,
    "\n tail",
    tail
  );
  return [...head, tail];
}

//#################### 컴포넌트 선언 ####################
export default function ContractSignature() {
  // Routing & Hooks
  const createSecureAxios = useSecureAxiosFactory();
  const authAxios = createSecureAxios("/rest/contract");
  const { encrypt, decrypt } = useAES256();
  const navigate = useNavigate();
  const location = useLocation();
  const { encryptedContId } = useParams();
  console.log(encryptedContId, location.pathname);
  const contId = decrypt(encryptedContId);
  const { HOSTNAME } = useDomain();
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const createHash = useSignatureHash();
  const decryptedContId = useMemo(
    () => decrypt(encryptedContId),
    [encryptedContId]
  );
  const wsRef = useRef(null);
  const realtimeWsRef = useRef(null);
  const initWsRef = useRef(null);

  // State
  const [refreshCount, setRefreshCount] = useState(Date.now());
  const [refreshPdfUrl, setRefreshPdfUrl] = useState(null);
  const [myRole, setMyRole] = useState();
  const [state, dispatch] = useReducer(
    contractSignatureReducer,
    initialSignatureState
  );

  //#################### useEffect: STATE ####################
  //
  useEffect(
    () => localStorage.setItem("ACTIVE_SIGN_CONTID", decryptedContId),
    []
  );

  useEffect(() => {
    console.log("👤 signerInfo 상태", state.signerInfo);
  }, [state.signerInfo]);

  //인가처리
  useEffect(() => {
    console.log("encryptedContId", encryptedContId);
    if (encryptedContId) {
      (async () => {
        try {
          const data = await authAxios.post("authorize", {
            encryptedContId,
            _method: "GET",
          });
          console.log("^0^^0^^0^ 복호화된 인가 응답:", data);
          console.log("📦 응답 타입:", typeof data);
          console.log("📦 응답 내용:", data);
          console.log("✅ success 타입:", typeof data.success);
          if (!data.success) {
            Swal.fire("접근 불가", data.message, "info");
            navigate("/signin");
          } else {
            localStorage.setItem("ACTIVE_SIGN_CONTID", data.contId);
            const joined_payload = {
              contId: data.contId,
              status: MSG.U_JOINED,
              role: data.role,
              code: data.code,
              id: data.id,
              name: data.name,
              telno: data.telno,
              ipAddr: data.ipAddr,
              hashVal: null,
              isValid: data.isValid,
              signedAt: null,
            };
            console.log("^ㅂ^^ㅂ^^ㅂ^^ㅂ^^ㅂ^^ㅂ^", joined_payload);
            const updatedSigners = (data.signers || []).map((s) => {
              const isMe =
                s.role === joined_payload.role &&
                (s.id === joined_payload.id || s.code === joined_payload.code);
              return {
                ...s,
                status: isMe ? joined_payload.status : s.status ?? null,
              };
            });
            dispatch({
              type: MSG.SET_CONT_ID,
              payload: data.contId, // 신규 action 추가 필요
            });
            dispatch({
              type: MSG.U_JOINED,
              payload: joined_payload,
            });
            dispatch({
              type: MSG.SET_SIGNERS,
              payload: updatedSigners,
            });
            dispatch({
              type: MSG.SET_SIGNER_INFO,
              payload: joined_payload,
            });
            setMyRole(data.role);
            if (wsRef?.current) {
              // const payloadStr = JSON.stringify(joined_payload);
              // wsRef.current.send(`${MSG.U_JOINED}:${data.contId}:${data.role}:${payloadStr}`);
              const message = {
                type: MSG.U_JOINED,
                contId: data.contId,
                role: data.role,
                payload: joined_payload,
              };
              wsRef.current.send(JSON.stringify(message));
            } else {
              console.warn("❗ WebSocket이 아직 연결되지 않았어요!");
            }
            localStorage.setItem("ACTIVE_SIGNER_INFO", data.signers);
          }
        } catch (err) {
          console.error("🔥 인가 처리 중 에러 발생:", err); // ✅ 이거 추가해!
          console.log("🧪 wsRef 상태:", wsRef);
          console.log("🧪 wsRef.current:", wsRef?.current);
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

  //#################### useEffect: WebSocket ####################
  // useEffect(() => {
  //   const wsActiveContId = state.contId || contId;
  //   if (!wsActiveContId || !myRole) return;

  //   const wsUrl = `${protocol}://${HOSTNAME}/ws/signers?contId=${wsActiveContId}&role=${myRole}`;
  //   console.log("--<><>WebSocket 연결 시도:", wsUrl);
  //   const ws = new WebSocket(wsUrl);
  //   wsRef.current = ws;

  //   ws.onopen = () => {
  //     console.log("_--<><><> WebSocket opened");
  //     const payload = JSON.stringify(state.signerInfo);
  //     const message = {
  //       type: MSG.U_JOINED,
  //       contId: state.contId,
  //       role: myRole,
  //       payload: state.signerInfo,
  //     };
  //     ws.send(JSON.stringify(message));
  //   };
  //   ws.onmessage = event => {
  //     const rawMessage = event.data;
  //     console.log("--<><><> 수신 메시지: ", rawMessage);

  //     // const [type, messageContId, role, recievedPayload] = splitWithLimit(rawMessage, ":", 3);
  //     // if (!recievedPayload || messageContId !== wsActiveContId) {
  //     //   console.warn("payload 누락된 WebSocket 메시지는 무시됩니다.", rawMessage);
  //     //   return;
  //     // }

  //     // let parsedPayload;
  //     // try {
  //     //   parsedPayload = JSON.parse(recievedPayload);
  //     // } catch (err) {
  //     //   console.error("파싱 에러", err);
  //     //   //잘못된 메시지는 수신 후 파기
  //     //   return;
  //     // }
  //     let parsed;
  //     try {
  //       parsed = JSON.parse(rawMessage);
  //     } catch (error) {
  //       console.error("[WEBSOCKET] JSON 파싱 실패: ", error);
  //       return;
  //     }

  //     const { type, contId, role, payload } = parsed;
  //     if (!type || !payload || contId !== wsActiveContId) return;

  //     const isMe =
  //       payload?.role === state.signerInfo.role &&
  //       (payload?.id === state.signerInfo.id || payload?.code === state.signerInfo.code);

  //     switch (type) {
  //       case MSG.U_JOINED:
  //       case MSG.U_SIGNED:
  //       case MSG.U_REJECTED:
  //       case MSG.U_DISCONNECTED: {
  //         dispatch({ type, role, payload });
  //         if (isMe) {
  //           dispatch({ type: MSG.SET_SIGNER_INFO, payload });
  //         } else if (type === MSG.U_JOINED) {
  //           sendMyPresence(); //뒤늦은 접속자에게 먼저 번 상태 갱신
  //         }
  //         break;
  //       }
  //       case MSG.P_SIGNED_TEMP1:
  //       case MSG.P_SIGNED_TEMP2:
  //       case MSG.P_ALL_SIGNED: {
  //         const { tempPdfUrl, signerInfo } = payload;

  //         // signerInfo와 상태 갱신
  //         if (signerInfo && isMe) {
  //           dispatch({ type: MSG.SET_SIGNER_INFO, payload: signerInfo });
  //         }

  //         if (tempPdfUrl) {
  //           dispatch({ type: MSG.SET_TEMP_PDF_URL, payload: tempPdfUrl });
  //           setRefreshPdfUrl(tempPdfUrl);
  //         }

  //         if (type === MSG.P_ALL_SIGNED) {
  //           dispatch({ type: MSG.SET_LOADING, payload: true });
  //           // 여기서 계약 확정 API 호출 로직 삽입 가능
  //         }
  //         break;
  //       }
  //       case MSG.P_EXPIRED:
  //         Swal.fire({
  //           icon: "info",
  //           title: "서명 만료",
  //           text: "전자서명의 유효 시간이 만료되었습니다.",
  //           confirmButtonColor: "#085D89", // sky-800
  //         }).then(() => {
  //           if (window.history.length > 1) navigate(-1);
  //           else navigate("/");
  //         });
  //         break;
  //       default: {
  //         console.warn("[WEBSOCKET] 잘못된 MSG TYPE: ", type);
  //         Swal.fire("알 수 없는 메시지 수신", rawMessage, "warning");
  //       }
  //     }
  //   };

  //   ws.onerror = error => console.error("[WEBSOCKET] ERROR:", error);
  //   ws.onclose = () => console.log("[WEBSOCKET] CLOSING...");

  //   return () => { console.log("[WEBSOCKET] CLEAR & CLOSURE"); ws.close(); }
  // }, [state.contId, contId, myRole, HOSTNAME, protocol]);

  // STEP 1. INIT 채널 연결
  useEffect(() => {
    const wsActiveContId = state.contId || contId;
    if (!wsActiveContId || !myRole) return;

    const initWsUrl = `${protocol}://${HOSTNAME}/ws/signers/init?type=INIT&contId=${wsActiveContId}&role=${myRole}`;
    const initWs = new WebSocket(initWsUrl);
    initWsRef.current = initWs;

    initWs.onopen = () => {
      initWs.send(msg);
      console.log("_--<><><> WebSocket opened");
      const msg = {
        type: "INIT_REQUEST",
        contId: wsActiveContId,
        role: myRole,
        payload: state.signerInfo,
      };
      initWs.send(JSON.stringify(msg));
    };

    initWs.onmessage = (event) => {
      const rawMessage = event.data;
      console.log("--<><><> 수신 메시지: ", rawMessage);
      try {
        const { type, contId, payload } = JSON.parse(event.data);
        if (type === "INIT_RESPONSE" && contId === wsActiveContId) {
          dispatch({ type: MSG.SET_SIGNERS, payload });
        }
      } catch (err) {
        console.error("INIT_WS 수신 실패:", err);
      }
    };

    initWs.onerror = (error) => console.error("[INIT_WS] 오류:", error);
    initWs.onclose = () => console.log("[INIT_WS] 종료됨");

    return () => initWs.close();
  }, [state.contId, contId, myRole]);

  // STEP 2. 실시간 채널 연결
  useEffect(() => {
    const wsActiveContId = state.contId || contId;
    if (!wsActiveContId || !myRole) return;

    const wsUrl = `${protocol}://${HOSTNAME}/ws/signers?contId=${wsActiveContId}&role=${myRole}`;
    const ws = new WebSocket(wsUrl);
    realtimeWsRef.current = ws;

    ws.onopen = () => {
      sendWsMessage(MSG.U_JOINED, state.signerInfo);
    };

    ws.onmessage = (event) => {
      try {
        const { type, contId, role, payload } = JSON.parse(event.data);
        if (!type || contId !== wsActiveContId) return;

        if (type === "INIT_REQUEST") {
          const response = {
            type: "INIT_RESPONSE",
            contId,
            role: myRole,
            payload: state.signers,
          };
          ws.send(JSON.stringify(response));
          return;
        }

        dispatch({ type, role, payload });

        const isMe =
          payload.role === state.signerInfo.role &&
          (payload.id === state.signerInfo.id ||
            payload.code === state.signerInfo.code);
        if (isMe) {
          dispatch({ type: MSG.SET_SIGNER_INFO, payload });
        }
      } catch (error) {
        console.error("[REALTIME_WS] 파싱 실패:", error);
      }
    };

    ws.onerror = (error) => console.error("[REALTIME_WS] 오류:", error);
    ws.onclose = () => console.log("[REALTIME_WS] 종료됨");

    return () => ws.close();
  }, [state.contId, contId, myRole]);

  // const sendMyPresence = () => {
  //   if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

  //   const myMessage = {
  //     type: MSG.U_JOINED,
  //     contId: state.contId,
  //     role: myRole,
  //     payload: state.signerInfo,
  //   };

  //   wsRef.current.send(JSON.stringify(myMessage));
  // }

  const sendWsMessage = (type, payloadObj) => {
    const msgObj = {
      type,
      contId: state.contId,
      role: myRole,
      payload: payloadObj,
    };
    const msg = JSON.stringify(msgObj);
    realtimeWsRef.current?.send(msg);
  };

  /*
  [실시간 전파 전용]
  "SIGNED:<contId>:<role>"를 WS로 broadcast하고, reducer로 local 상태 갱신
    -WebSocket 전파용 메시지 전송
    -내부 state.signatureStatus 갱신
    -signerInfo.signedAt 값만 상태로 갱신
  =>SignatureCanvas 컴포넌트로 이식
  */
  const onSigned = () => {
    const now = new Date().toISOString();
    const updatedSigner = {
      ...state.signerInfo,
      signedAt: now,
      status: MSG.U_SIGNED,
    };

    // dispatch({
    //   type: MSG.SET_SIGNATURE_STATUS,
    //   payload: {
    //     ...state.signatureStatus,
    //     [state.signerInfo.role.toLowerCase()]: MSG.U_SIGNED,
    //   },
    // });
    // dispatch({ type: MSG.SET_SIGNED_AT, payload: now });
    dispatch({ type: MSG.SET_SIGNED_AT, payload: now });
    dispatch({
      type: MSG.SET_SIGNATURE_STATUS,
      payload: {
        ...state.signatureStatus,
        [updatedSigner.role.toLowerCase()]: MSG.U_SIGNED,
      },
    });

    //상태가 반영된 이후에 signers를 기준으로 count 계산
    setTimeout(() => {
      const signedCount =
        state.signers.filter((userInfo) => userInfo.signedAt).length + 1;

      let type = MSG.P_SIGNED_TEMP1;
      if (signedCount === 2) type = MSG.P_SIGNED_TEMP2;
      if (signedCount >= 3) type = MSG.P_ALL_SIGNED;
      sendWsMessage(type, {
        signerInfo: updatedSigner,
        tempPdfUrl: state.tempPdfUrl,
      });
    }, 10);
    //   if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    //     // const message = `${type}:${contId}:${myRole}:${JSON.stringify({
    //     //   signerInfo: {
    //     //     ...state.signerInfo,
    //     //     signedAt: now,
    //     //     status: MSG.U_SIGNED,
    //     //   },
    //     //   tempPdfUrl: state.tempPdfUrl,
    //     // })}`;
    //     // wsRef.current.send(message);
    //     const message = {
    //       type,
    //       contId,
    //       role: myRole,
    //       payload: {
    //         signerInfo: {
    //           ...state.signerInfo,
    //           signedAt: now,
    //           status: MSG.U_SIGNED,
    //         },
    //         tempPdfUrl: state.tempPdfUrl
    //       }
    //     };
    //     wsRef.current.send(JSON.stringify(message));

    //   }
    // }, 10); // setTimeout으로 상태 반영 이후 계산 타이밍 확보
  };

  /*
  [서버 제출용]
  전자서명 이미지 및 메타데이터를 서버에 저장
  -계약 ID와 signerInfo를 기반으로 서버에 DB 등록용 DTO(payload) 전송
  -여기서 hashVal, signedAt, ipAddr, base64 등을 함께 서버에 전달함
  */
  async function handleSignatureImageToServer({
    contId,
    base64Image,
    signerInfo,
  }) {
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
    };

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
            const {
              base64,
              mbrCd,
              mbrNm,
              signedAt,
              contDtSignType,
              contDtSignHashVal,
              contDtSignDtm,
            } = signer;

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
              isValid: contDtSignDtm
                ? expectedHash === contDtSignHashVal
                : undefined,
              isRejected: signer.isRejected ?? false,
              tempPdfUrl: signer.tempPdfUrl ?? null,
            };
          });

          dispatch({ type: "SET_SIGNERS", payload: validatedSigners });
          console.log("✅ 서명 상태 로딩 완료:", validatedSigners);
          console.log(
            "✅ reducer 전달 직전 payload 길이:",
            validatedSigners.length
          );
        }
      } catch (err) {
        console.error("❌ 서명 상태 조회 오류", err);
      }
    };

    fetchSignatureStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contId]);

  //계약서 메타 정보 로딩 (ex. 계약서 제목, 작성일, 서명자 목록, 해시값 등)
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

  const handleSignatureComplete = async ({ dataUrl, signerInfo }) => {
    const now = new Date().toISOString();
    const hashVal = createHash({
      base64Image: dataUrl,
      telno: signerInfo.telno,
      contId,
      role: signerInfo.role,
      signedAt: now,
    });

    const completeInfo = {
      ...signerInfo,
      signedAt: now,
      hashVal,
      status: MSG.U_SIGNED,
    };

    try {
      //tempPdf 업로드
      const payload = {
        _method: "POST",
        contractDigitalSign: {
          contId,
          // contDtSignId: null,
          contDtSignType: signerInfo.role,
          contDtBaseData: dataUrl,
          contDtSignDtm: now,
          contDtSignHashVal: hashVal,
          mbrCd: localStorage.getItem("mbrCd") || "TEMP",
          contDtSignStat: "N",
        },
      };

      const data = await authAxios.post("signature/upload", payload);
      if (!data?.success || !data?.fileUrl) {
        throw new Error("임시 서명 PDF 업로드 실패");
      }

      const tempPdfUrl = data.fileUrl;
      const tempFileId = data.fileId;
      console.log("----<><>\n방금수정한 따끈따끈 임시파일 ID::", tempFileId);

      //상태 갱신
      dispatch({ type: MSG.SET_SIGNER_INFO, payload: completeInfo });
      dispatch({
        type: MSG.SET_SIGNATURE_STATUS,
        payload: {
          ...state.signatureStatus,
          [signerInfo.role.toLowerCase()]: MSG.U_SIGNED,
        },
      });
      dispatch({ type: MSG.SET_SIGNED_AT, payload: now });
      dispatch({ type: MSG.SET_TEMP_PDF_URL, payload: tempPdfUrl });
      dispatch({ type: MSG.SET_TEMP_PDF_FILE_ID, payload: tempFileId });
      setRefreshPdfUrl(tempPdfUrl);

      //WebSocket 메시지 전파
      setTimeout(() => {
        const signedCount =
          state.signers.filter((userInfo) => userInfo.signedAt).length + 1;

        let type = MSG.P_SIGNED_TEMP1;
        if (signedCount === 2) type = MSG.P_SIGNED_TEMP2;
        if (signedCount >= 3) type = MSG.P_ALL_SIGNED;

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          // wsRef.current.send(
          //   `${type}:${contId}:${myRole}:${JSON.stringify({
          //     tempPdfUrl,
          //     signerInfo: completeInfo,
          //   })}`
          // );
          const message = {
            type,
            contId,
            role: myRole,
            payload: {
              tempPdfUrl,
              signerInfo: completeInfo,
            },
          };
          wsRef.current.send(JSON.stringify(message));
        }
      }, 10);

      //서버 저장용 업로드
      await handleSignatureImageToServer({
        contId,
        base64Image: dataUrl,
        signerInfo: completeInfo,
      });

      //PDF Viewer 리프레시
      setRefreshCount(Date.now());

      Swal.fire(
        "서명 완료",
        "계약서에 서명을 성공적으로 등록했습니다.",
        "info"
      );
    } catch (error) {
      console.error("❌ 서명 완료 처리 중 오류 발생", error);
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
    if (!confirmed.isConfirmed) return;

    const rejectedInfo = {
      ...state.signerInfo,
      isRejected: true,
      status: MSG.U_REJECTED,
    };

    try {
      //상태 갱신
      dispatch({ type: MSG.SET_SIGNER_INFO, payload: rejectedInfo });
      dispatch({
        type: MSG.SET_SIGNATURE_STATUS,
        payload: {
          ...state.signatureStatus,
          [rejectedInfo.role.toLowerCase()]: MSG.U_REJECTED,
        },
      });
      dispatch({ type: MSG.SET_TEMP_PDF_URL, payload: null });
      setRefreshPdfUrl(null);

      // //WebSocket 전파
      // if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      //   // wsRef.current.send(`REJECTED:${contId}:${myRole}:${JSON.stringify(rejectedInfo)}`);
      //   const message = {
      //     type: MSG.U_REJECTED,
      //     contId,
      //     role: myRole,
      //     payload: rejectedInfo,
      //   };
      //   wsRef.current.send(JSON.stringify(message));
      // }

      sendWsMessage(MSG.U_REJECTED, rejectedInfo);

      //임시 PDF 삭제
      await deleteTempSignedPdf(state.tempPdfFileIds);
      dispatch({ type: MSG.SET_TEMP_PDF_FILE_IDS, payload: [] });
      Swal.fire("거절 완료", "서명 절차를 종료합니다.", "info").then(() => {
        navigate("/");
      });
    } catch (err) {
      console.error("❌ 서명 거절 처리 실패", err);
      Swal.fire("오류", "서명 거절 중 오류가 발생했습니다.", "error");
    }
  };

  const deleteTempSignedPdf = async (tempPdfFileIds = []) => {
    if (!Array.isArray(tempPdfFileIds) || tempPdfFileIds.length === 0) {
      console.warn("❗ 삭제할 fileId 목록이 비어 있음");
      return false;
    }

    try {
      const response = await authAxios.post("pdf/delete-temp", {
        tempPdfFileIds, // ← 배열로 전송
        _method: "DELETE",
      });

      if (response?.success) {
        console.log("🧹 임시 PDF 삭제 성공:", tempPdfFileIds);
        return true;
      } else {
        console.warn("⚠️ 삭제 실패:", response?.message);
        return false;
      }
    } catch (err) {
      console.error("❌ 임시 PDF 삭제 중 에러:", err);
      return false;
    }
  };

  const isAllSigned = (signers) => {
    return signers.every((s) => s.signedAt && !s.isRejected);
  };

  useEffect(() => {
    console.log("👤 signerInfo 상태", state.signerInfo);

    if (!contId || !state.signers || state.signers.length === 0) return;

    // 전부 서명됐는지 확인
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
        // if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        //   // wsRef.current.send(`COMPLETED:${contId}`);
        //   const message = {
        //     type: "COMPLETED",
        //     contId,
        //     role: myRole,
        //     payload: null, // 또는 생략해도 괜찮지만 명시하면 명확함
        //   };
        //   wsRef.current.send(JSON.stringify(message));
        // }

        sendWsMessage("COMPLETED", null);
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

  //#################### 렌더링 ####################
  if (state.error) {
    return <div className="text-red-500">에러 발생: {state.error.message}</div>;
  }
  if (!state.contId) {
    return <div className="text-yellow-500">계약 ID가 유효하지 않습니다.</div>;
  }
  if (!state.contId && !state.signerInfo?.contId) {
    return <div className="text-white">계약 정보를 불러오는 중입니다...</div>;
  }
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white p-6 space-y-6">
      <h1 className="text-2xl font-semibold">전자계약 서명 {state.contId}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow-md overflow-auto max-h-[75vh]">
          <h2 className="text-lg font-semibold mb-4">계약서 미리보기</h2>
          <SignaturePDFViewer
            contId={state.contId}
            refreshKey={refreshCount}
            overrideUrl={refreshPdfUrl}
          />
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">서명 상태</h2>
            <SignatureStatusBoard
              signers={state.signers}
              onPreview={(fileUrl) => setRefreshPdfUrl(fileUrl)}
              contId={contId}
            />
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">서명하기</h2>
            <SignatureCanvas
              signerInfo={state.signerInfo}
              onSignatureComplete={handleSignatureComplete}
              onSignComplete={() => setRefreshCount(Date.now())}
              onReject={handleReject}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
