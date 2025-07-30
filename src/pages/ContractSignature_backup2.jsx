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
import { contractSignatureReducer, initialSignatureState } from "../reducers/contractSignatureReducer";
import { useAES256 } from "../hooks/useAES256";
import { waitForStateChange } from "../js/waitForStateChange";
import { normalizeSigner } from "../js/normalizeSigner";
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
  SET_TEMP_PDF_FILE_IDS: "TEMP_PDF_FILE_IDS",
  SET_PDF_DATA: "PDF_DATA",
  SET_CONT_ID: "CONT_ID",
  SET_INIT_REQUEST: "INIT_REQUEST",
  SET_INIT_RESPONSE: "INIT_RESPONSE",
};
//메시지 페이로드 온전히 유지하기 위한 유틸함수.
function splitWithLimit(str, delimiter, limit) {
  const parts = str.split(delimiter);
  const head = parts.slice(0, limit);
  const tail = parts.slice(limit).join(delimiter);
  console.log("splitWithLimit 함수로 메시지 분석:: ", "\n parts::", parts, "\n head", head, "\n tail", tail)
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
  console.log(encryptedContId, location.pathname)
  const contId = decrypt(encryptedContId);
  const { HOSTNAME } = useDomain();
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const createHash = useSignatureHash();
  const wsRef = useRef(null);
  const realtimeWsRef = useRef(null);
  const initWsRef = useRef(null);

  // State
  const [refreshCount, setRefreshCount] = useState(Date.now());
  const [refreshPdfUrl, setRefreshPdfUrl] = useState(null);
  const [myRole, setMyRole] = useState();
  const [state, dispatch] = useReducer(contractSignatureReducer, initialSignatureState);
  const [authorizedContId, setAuthorizedContId] = useState(null);
  const [validContId, setValidContId] = useState(true);
  const getStateRef = useRef();
  getStateRef.current = state;
  //#################### useEffect: STATE ####################
  // 
  useEffect(() =>
    localStorage.setItem("ACTIVE_SIGN_CONTID", contId)
    , [])

  useEffect(() => {
    console.log("👤 signerInfo 상태", state.signerInfo);
    if (state.signerInfo?.role) {
      localStorage.setItem("AUTHORIZED_SIGNER", JSON.stringify(state.signerInfo));
    }
  }, [state.signerInfo]);

  useEffect(() => {
    const isValid = typeof state.contId === "string" && state.contId.length >= 10;
    localStorage.setItem("ACTIVE_SIGN_CONTID", contId);
    setValidContId(isValid);
  }, [state.contId]);

  //인가처리
  useEffect(() => {
    if (!encryptedContId) {
      dispatch({ type: MSG.SET_LOADING, payload: false });
      return;
    }

    const handleAuthorization = async () => {
      try {
        console.log("🔐 [AUTH] 인가 요청 시작:", encryptedContId);

        // 1. 서버 인가 요청
        const { success, message, ...data } = await authAxios.post("authorize", {
          encryptedContId,
          _method: "GET",
        });

        if (!success) {
          Swal.fire("접근 불가", message, "info");
          navigate("/signin");
          return;
        }

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
          connected: data.connected,
        };

        console.log("✅ [AUTH] 인가 성공:", joined_payload);

        // 2. contId 설정
        dispatch({ type: MSG.SET_CONT_ID, payload: joined_payload.contId });

        // 3. signers 가공 및 세팅
        const updatedSigners = (data.signers || []).map(userInfo => {
          const isMe =
            userInfo.role === joined_payload.role &&
            (userInfo.id === joined_payload.id || userInfo.code === joined_payload.code);

          return normalizeSigner({
            ...userInfo,
            status: isMe ? joined_payload.status : userInfo.status ?? null,
            contId: joined_payload.contId,
          });
        });

        dispatch({ type: MSG.SET_SIGNER_INFO, payload: normalizeSigner(joined_payload) });
        dispatch({ type: MSG.U_JOINED, payload: joined_payload });
        dispatch({ type: MSG.SET_SIGNERS, payload: updatedSigners });
        dispatch({ type: MSG.SET_LOADING, payload: false });

        console.log("🧾 상태 직전:", getStateRef.current);

        // 4. 상태 안정화 기다리기 (로딩 종료 & 나의 signerInfo 확보)
        await waitForStateChange(
          (s) => s.loading === false && !!s.signerInfo?.id,
          () => getStateRef.current,
          5000
        );

        // 5. WebSocket 연결 여부 확인 후 JOINED 메시지 전송
        setMyRole(data.role);

        if (realtimeWsRef?.current?.readyState === WebSocket.OPEN) {
          const message = {
            type: MSG.U_JOINED,
            contId: joined_payload.contId,
            role: joined_payload.role,
            payload: joined_payload,
          };
          waitForSocketConnection(realtimeWsRef.current, () => {
            realtimeWsRef.current.send(JSON.stringify(message));
            console.log("📡 WebSocket JOINED 전송 완료");
          });
        } else {
          console.warn("⛔ WebSocket 연결되지 않음!");
        }

        // 6. signers 로컬 저장
        localStorage.setItem("ACTIVE_SIGNER_INFO", JSON.stringify(data.signers));

      } catch (err) {
        console.error("🔥 [AUTH] 인가 중 오류:", err);
        dispatch({ type: MSG.SET_ERROR, payload: err });
        Swal.fire("오류", "접근 실패", "error");
        navigate("/");
      }
    };

    handleAuthorization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encryptedContId]);

  const waitForSocketConnection = (socket, callback, retries = 20) => {
    setTimeout(() => {
      if (socket.readyState === WebSocket.OPEN) {
        callback();
      } else {
        if (retries <= 0) {
          console.warn("💣 WebSocket 연결 실패. 메시지 전송 중단.");
          return;
        }
        waitForSocketConnection(socket, callback, retries - 1);
      }
    }, 150); // 150ms 간격으로 재시도
  };

  //#################### useEffect: WebSocket ####################
  const latestSigners = getStateRef.current.signers;

  useEffect(() => {
    console.log("🧾 동기화 후 signers:", state.signers);
  }, [state.signers]);
  // STEP 1. INIT 채널 연결
  useEffect(() => {
    const raw = localStorage.getItem("AUTHORIZED_SIGNER");
    const cachedSigner = raw ? JSON.parse(raw) : null;
    const fallbackRole = cachedSigner?.role;
    const wsEffectiveRole = myRole || fallbackRole;
    const wsActiveContId = state.contId || state.signerInfo?.contId;
    if (!wsActiveContId || !wsEffectiveRole) return;

    const initWsUrl = `${protocol}://${HOSTNAME}/ws/signers/init?type=INIT&contId=${wsActiveContId}&role=${wsEffectiveRole}`;
    const initWs = new WebSocket(initWsUrl);
    initWsRef.current = initWs;

    initWs.onopen = () => {
      if (!state.signers || state.signers.length === 0) {
        console.warn("⛔ INIT_WS 연결 보류: state.signers가 준비되지 않음");
        return;
      }
      console.log("_--<><><> WebSocket opened");
      const msg = {
        type: MSG.SET_INIT_REQUEST,
        contId: wsActiveContId,
        role: wsEffectiveRole,
        payload: state.signerInfo,
      };
      // initWs.send(JSON.stringify(msg));
      sendWsMessage(MSG.SET_INIT_REQUEST, state.signerInfo);
    };

    initWs.onmessage = (event) => {
      const rawMessage = event.data;
      try {
        const { type, contId, role, payload } = JSON.parse(rawMessage);
        console.log("🧩 수신된 INIT_REQUEST payload = ", payload);

        if (!type || contId !== wsActiveContId) return;

        // 💬 [1] SET_INIT_REQUEST 수신 시 → 응답도 보내고, 상대 signers도 반영
        if (type === MSG.SET_INIT_REQUEST) {
          // 1. 나의 signers를 상대방에게 보내기 (INIT_RESPONSE)
          if (!Array.isArray(latestSigners) || latestSigners.length === 0) {
            console.warn("⛔ SET_INIT_REQUEST 전송 취소: signers가 비어있음");
            return;
          }
          const response = {
            type: MSG.SET_INIT_RESPONSE,
            contId,
            role: myRole,
            payload: getStateRef.current.signers,
          };
          initWsRef.current?.send(JSON.stringify(response));
          console.log("🔁 INIT_RESPONSE 전송 완료", response);

          // 2. 동시에 상대방의 signers도 반영
          const normalizedRequestList = Array.isArray(payload)
            ? payload.map(normalizeSigner)
            : [];
          if (normalizedRequestList.length > 0) {
            dispatch({ type: MSG.SET_SIGNERS, payload: normalizedRequestList });
            console.log("💡 SET_SIGNERS (상대방 INIT_REQUEST):", normalizedRequestList);
          }
          return;
        }

        // 💬 [2] SET_INIT_RESPONSE 수신 시 → 상대방 signers 반영
        if (type === MSG.SET_INIT_RESPONSE) {
          const normalizedResponseList = Array.isArray(payload)
            ? payload.map(normalizeSigner)
            : [];
          if (normalizedResponseList.length === 0) {
            console.warn("⚠️ INIT_WS 응답이 비었거나 형식이 잘못됨:", payload);
            return;
          }
          dispatch({ type: MSG.SET_SIGNERS, payload: normalizedResponseList });
          console.log("📨 SET_SIGNERS (INIT_RESPONSE):", normalizedResponseList);
        }

        // 💡 상태 디버깅
        setTimeout(() => {
          console.log("🧾 [AFTER] state.signers:", getStateRef.current.signers);
        }, 300);

      } catch (error) {
        console.error("INIT_WS 수신 실패:", error);
      }
    };


    initWs.onerror = error => console.error("[INIT_WS] 오류:", error);
    initWs.onclose = () => console.log("[INIT_WS] 종료됨");

    return () => initWs.close();
  }, [state.contId, contId, myRole]);

  // STEP 2. 실시간 채널 연결
  useEffect(() => {

    const wsActiveContId = state.contId || contId || state.signerInfo?.contId;

    // if (!wsActiveContId || !myRole) return;
    if (!wsActiveContId || !myRole || !state.signerInfo?.role) return;

    const wsUrl = `${protocol}://${HOSTNAME}/ws/signers?contId=${wsActiveContId}&role=${myRole}`;
    const ws = new WebSocket(wsUrl);
    realtimeWsRef.current = ws;

    ws.onopen = () => {
      // 🔒 이 시점에는 state.signerInfo가 불완전할 수 있으니,
      //    authorize 응답 기반으로 안전한 값만 사용해야 함

      const safeRole = state.signerInfo?.role ?? myRole ?? "UNKNOWN";
      const safeContId = state.contId;

      // 1. 서버에게 "나 접속했어" 알림
      sendWsMessage(MSG.U_JOINED, {
        role: safeRole,
        connected: true,
      });

      // 2. 서버에게 현재 내가 갖고 있는 서명자 정보 공유
      if (Array.isArray(state.signers) && state.signers.length > 0) {
        realtimeWsRef.current?.send(
          JSON.stringify({
            type: MSG.SET_INIT_REQUEST,
            contId: safeContId,
            role: safeRole,
            payload: state.signers, // ⚠️ 반드시 signers: Signer[] 구조여야 함!
          })
        );
      } else {
        console.warn("⚠️ INIT_REQUEST 전송 실패: state.signers가 비었거나 유효하지 않음", state.signers);
      }
    };

    ws.onmessage = event => {
      try {
        const { type, contId, role, payload } = JSON.parse(event.data);
        console.log("📨 WebSocket message:", type, payload);

        if (!type || contId !== wsActiveContId) return;

        if (type === MSG.SET_INIT_REQUEST) {
          const response = {
            type: MSG.SET_INIT_RESPONSE,
            contId,
            role: myRole,
            payload: state.signers,
          };
          ws.send(JSON.stringify(response));
          return;
        }

        if ([MSG.U_JOINED, MSG.U_SIGNED, MSG.U_REJECTED, MSG.U_DISCONNECTED].includes(type)) {
          // 추가 로직: 서버에 서명자 상태 재요청
          authAxios.post("signature/status", {
            contId,
            _method: "GET",
          }).then(data => {
            if (data.success) {
              console.log("::::::345:::::::::^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ^ㅂ^ㅗ", data.signers);
              dispatch({ type: MSG.SET_SIGNERS, payload: data.signers.map(normalizeSigner) });
            }
          });
        }

        // dispatch({ type, role, payload });

        // const isMe =
        //   payload.role === state.signerInfo.role &&
        //   (payload.id === state.signerInfo.id || payload.code === state.signerInfo.code);
        // if (isMe) {
        //   dispatch({ type: MSG.SET_SIGNER_INFO, payload: normalizeSigner(payload), });
        // }
        // setTimeout(() => {
        //   console.log("🧾 [AFTER] state.signers:", getStateRef.current.signers);
        // }, 300);
      } catch (error) {
        console.error("[::REALTIME_WS] 파싱 실패:", error);
      }
    };

    ws.onerror = error => console.error("[REALTIME_WS] 오류:", error);
    ws.onclose = () => console.log("[REALTIME_WS] 종료됨");

    return () => ws.close();
  }, [state.contId, contId, myRole]);

  const sendWsMessage = (type, payloadObj) => {
    const contIdToSend = state.contId || contId || state.signerInfo?.contId;
    if (!contIdToSend || contIdToSend.length < 10) {
      console.warn("[::sendWsMessage] 유효하지 않은 contId → 메시지 전송 생략:", type);
      return;
    }
    const msgObj = {
      type,
      contId: state.contId,
      role: myRole,
      payload: payloadObj,
    };
    const msg = JSON.stringify(msgObj);

    const ws = realtimeWsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    } else {
      console.warn("❗ WebSocket이 열리지 않았음 → 메시지 미전송:", msgObj);
    }
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

    dispatch({ type: MSG.SET_SIGNED_AT, payload: now });
    dispatch({
      type: MSG.SET_SIGNATURE_STATUS,
      payload: {
        ...state.signatureStatus,
        [updatedSigner.role.toLowerCase()]: MSG.U_SIGNED,
      },
    });

    setTimeout(() => {
      const signedCount = state.signers.filter(s => s.signedAt).length + 1;
      let type = MSG.P_SIGNED_TEMP1;
      if (signedCount === 2) type = MSG.P_SIGNED_TEMP2;
      if (signedCount >= 3) type = MSG.P_ALL_SIGNED;

      sendWsMessage(type, {
        signerInfo: updatedSigner,
        tempPdfUrl: state.tempPdfUrl,
      });
    }, 10);
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
  const handleSignatureStatus = async () => {
    try {
      const response = await authAxios.post("signature/status", {
        contId,
        _method: "GET", // 백엔드에서 이걸 기준으로 GET 동작함
      });

      console.log("🛰 contId for status check", contId);
      console.log("✅ signers from server", response.signers);

      if (response.success && Array.isArray(response.signers)) {
        const validatedSigners = response.signers.map((signer) => {
          const { base64, mbrCd, mbrNm, mbrId, signedAt, contDtSignType, contDtSignHashVal, contDtSignDtm } = signer;

          const expectedHash = createHash({
            base64Image: base64,
            mbrCd,
            contId,
            role: contDtSignType,
            signedAt: contDtSignDtm,
          });

          return {
            contId,
            role: contDtSignType,
            code: mbrCd,
            name: mbrNm,
            id: mbrId,
            connected: false,
            signedAt: contDtSignDtm,
            isValid: contDtSignDtm ? expectedHash === contDtSignHashVal : undefined,
            isRejected: signer.isRejected ?? false,
            tempPdfUrl: signer.tempPdfUrl ?? null,
          };
        });

        // ✅ 반드시 filter(Boolean)으로 null 제거
        const normalizedSigners = validatedSigners.map(normalizeSigner).filter(Boolean);

        if (normalizedSigners.length > 0) {
          dispatch({ type: MSG.SET_SIGNERS, payload: normalizedSigners });
        } else {
          console.warn("🚫 유효한 signer 없음. reducer 업데이트 생략됨");
        }
      }
    } catch (err) {
      console.error("❌ 서명 상태 조회 오류", err);
    }
  };


  //계약서 메타 정보 로딩 (ex. 계약서 제목, 작성일, 서명자 목록, 해시값 등)
  useEffect(() => {
    if (!contId) return;
    (async () => {
      try {
        const response = await authAxios.post("pdf/meta", {
          contId,
          _method: "GET",
        });
        dispatch({ type: MSG.SET_PDF_DATA, payload: response });
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
      dispatch({ type: MSG.SET_SIGNER_INFO, payload: normalizeSigner(completeInfo) });
      dispatch({
        type: MSG.SET_SIGNATURE_STATUS, payload: {
          ...state.signatureStatus,
          [signerInfo.role.toLowerCase()]: MSG.U_SIGNED
        }
      });
      dispatch({ type: MSG.SET_SIGNED_AT, payload: now });
      dispatch({ type: MSG.SET_TEMP_PDF_URL, payload: tempPdfUrl });
      dispatch({ type: MSG.SET_TEMP_PDF_FILE_IDS, payload: tempFileId });
      setRefreshPdfUrl(tempPdfUrl);

      //WebSocket 메시지 전파
      setTimeout(() => {
        const signedCount = state.signers.filter(userInfo => userInfo.signedAt).length + 1;

        let type = MSG.P_SIGNED_TEMP1;
        if (signedCount === 2) type = MSG.P_SIGNED_TEMP2;
        if (signedCount >= 3) type = MSG.P_ALL_SIGNED;

        if (realtimeWsRef.current && realtimeWsRef.current.readyState === WebSocket.OPEN) {
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
              signerInfo: completeInfo
            }
          };
          realtimeWsRef.current.send(JSON.stringify(message));
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

      Swal.fire("서명 완료", "계약서에 서명을 성공적으로 등록했습니다.", "info");

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
      dispatch({ type: MSG.SET_SIGNER_INFO, payload: normalizeSigner(rejectedInfo) });
      dispatch({
        type: MSG.SET_SIGNATURE_STATUS, payload: {
          ...state.signatureStatus,
          [rejectedInfo.role.toLowerCase()]: MSG.U_REJECTED,
        }
      });
      dispatch({ type: MSG.SET_TEMP_PDF_URL, payload: null });
      setRefreshPdfUrl(null);

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

  const isAllSigned = signers => {
    return signers.every(s => s.signedAt && !s.isRejected);
  };

  useEffect(() => {
    console.log("👤 signerInfo 상태", state.signerInfo);

    if (!contId || !state.signers || state.signers.length === 0) return;

    // 전부 서명됐는지 확인
    if (isAllSigned(state.signers)) completeContract(contId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.signerInfo]);

  const completeContract = async contId => {
    try {
      const response = await authAxios.post("signature/complete", {
        contId,
        _method: "PUT",
      });

      if (response.success) {
        console.log("🎉 계약 확정 완료");

        //"COMPLETED"
        sendWsMessage(MSG.P_ALL_SIGNED, null);
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
  // 🔍 아직 authorize 중이거나 최초 진입 시
  if (state.loading || !encryptedContId || !state.signerInfo?.role) {
    return <div className="text-white">계약 정보를 불러오는 중입니다...</div>;
  }

  // 🔍 authorize는 완료됐지만 contId가 유효하지 않을 경우
  if (!validContId) {
    return <div className="text-yellow-500">계약 ID가 유효하지 않습니다.</div>;
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white p-6 space-y-6">
      <h1 className="text-2xl font-semibold">전자계약 서명 {JSON.stringify(state.contId)}</h1>
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
