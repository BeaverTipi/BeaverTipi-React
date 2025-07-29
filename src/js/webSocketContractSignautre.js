/*
const { 
  initWebSocket,
  realtimeWebSocket,
  cleanupWebSockets,
  dispatchWithWs,
} = createWebSocketHandlers({
  PROTOCOL,
  HOSTNAME,
  globalContId,
  myRole,
  initWsRef: initWs,
  realtimeWsRef: realtimeWs,
  dispatch,
});

// 예: 서명 이벤트 처리
const handleSign = () => {
  const payload = { signature: { contId: globalContId, signedAt: new Date().toISOString() } };
  dispatchWithWs({ type: MSG.U_SIGNED, payload }); // reducer + websocket 전송 동시에 수행
};
*/

/***여기 수정 필요 */
//  // 특정 액션만 WebSocket으로 전송
//  if ([MSG.U_JOINED, MSG.U_SIGNED, MSG.U_REJECTED].includes(action.type)) {
import { MSG } from "../js/reducerContractSignature";

function splitWithLimit(str, delimiter, limit) {
  const parts = str.split(delimiter);
  const head = parts.slice(0, limit);
  const tail = parts.slice(limit).join(delimiter);
  console.log("splitWithLimit 함수로 메시지 분석:: ", "\n parts::", parts, "\n head", head, "\n tail", tail)
  return [...head, tail];
}

export const createWebSocketHandlers = ({
  PROTOCOL,
  HOSTNAME,
  globalContId,
  myRole,
  initWsRef,
  realtimeWsRef,
  dispatch,
  getState,
}) => {
  const isAwaitingInitRef = { current: false }

  const buildUrl = (path) =>
    `${PROTOCOL}://${HOSTNAME}${path}?contId=${globalContId}&role=${myRole}`;

  const cleanupWebSockets = () => {
    if (initWsRef.current) {
      initWsRef.current.close();
      initWsRef.current = null;
    }
    if (realtimeWsRef.current) {
      realtimeWsRef.current.close();
      realtimeWsRef.current = null;
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") { cleanupWebSockets(); }
    else { initWebSocket(); realtimeWebSocket(); }
  }

  const initWebSocket = () => {
    cleanupWebSockets();

    const ws = new WebSocket(buildUrl("/ws/signers/init"));
    initWsRef.current = ws;

    ws.onopen = () => {
      const state = getState();
      const signerInfo = state.signers?.[myRole] || {};
      const payload = { signers: { [myRole]: signerInfo } };

      isAwaitingInitRef.current = true;
      sendInitMsg(MSG.INIT_REQUEST, payload);
      console.debug("[INIT_WS] 연결됨");
    };
    ws.onerror = error => console.error("[INIT_WS] 에러:", error);
    ws.onclose = () => console.debug("[INIT_WS] 종료됨");

  };

  const realtimeWebSocket = () => {
    const ws = new WebSocket(buildUrl("/ws/signers"));
    const roleToActionMap = {
      LESSEE: MSG.SET_SIGNERS_LESSEE,
      LESSOR: MSG.SET_SIGNERS_LESSOR,
      AGENT: MSG.SET_SIGNERS_AGENT,
    };
    realtimeWsRef.current = ws;

    ws.onopen = () => {
      console.debug("[REALTIME_WS] 연결됨");
      const state = getState();
      // sendMsg(MSG.INIT_REQUEST, state);
    }
    ws.onmessage = event => {
      const [type, contId, role, payloadJSON] = splitWithLimit(event.data, ":", 3);
      let payload = "";
      try {
        payload = JSON.parse(payloadJSON);
      } catch (error) {
        console.warn("[REALTIME_WS] 메시지 파싱 실패:", event.data, error);
      }

      switch (type) {
        case MSG.INIT_REQUEST: {
          console.debug("[REALTIME_WS] 다른 클라이언트(" + role + ") INIT_REQUEST 수신: ", payload);

          const state = getState();
          // sendMsg(MSG.INIT_RESPONSE, state);
          sendInitRequest(state);
          break;
        };
        case MSG.INIT_RESPONSE:
          console.debug("[REALTIME_WS] 다른 클라이언트(" + role + ") INIT_RESPONSE 수신: ", payload);
          if (isAwaitingInitRef.current) {
            // 내가 INIT_REQUEST를 보낸 직후 응답을 받음 → 상태 동기화
            dispatch({ type: MSG.RESET, payload: payload });
            isAwaitingInitRef.current = false; // 플래그 초기화
            console.debug("[REALTIME_WS] INIT_RESPONSE로 상태 동기화 완료");
          } else {
            const dynamicType = roleToActionMap[role];
            // 이미 연결된 상태에서 INIT_RESPONSE 수신 → 일반적인 실시간 동기화
            dispatch({ type: dynamicType, payload: payload.signers?.[role] });
            console.debug("[REALTIME_WS] 기존 상태와 동기화");
          }
          break;

        default: console.warn("[REALTIME_WS] 알 수 없는 메시지: ", type);
      }
    };
    ws.onerror = error => console.error("[REALTIME_WS] 에러:", error);
    ws.onclose = () => console.debug("[REALTIME_WS] 종료됨");
  };

  const sendInitRequest = (state) => {
    const message = `${MSG.INIT_REQUEST}:${globalContId}:${myRole}:${JSON.stringify({
      signers: state.signers,
    })}`;
    realtimeWsRef.current?.send(message); // ✅ initWs가 아니라 realtimeWs로 전송
    console.debug("[REALTIME_WS] INIT_REQUEST 전송:", message);
  };

  const sendInitMsg = (type, payloadObj = {}) => {
    const ws = initWsRef.current; // initWs를 사용해야 함
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("[INIT_WS] WebSocket 미연결 → 메시지 미전송:", type);
      return;
    }
    const message = `${type}:${globalContId}:${myRole}:${JSON.stringify(payloadObj)}`;
    ws.send(message);
    console.debug("[INIT_WS] 전송:", message);
  };

  const sendMsg = (type, payloadObj = {}) => {
    const ws = realtimeWsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket이 열리지 않았음 → 메시지 미전송:", {
        type,
        contId: globalContId,
        role: myRole,
      });
      return;
    }

    const message = `${type}:${globalContId}:${myRole}:${JSON.stringify(payloadObj)}`;
    ws.send(message);
    console.debug("[sendMsg] 전송:", message);
  };



  // dispatch를 WebSocket 통합형으로 래핑
  const createDispatchWithWebSocket = () => (action) => {
    dispatch(action);

    // 특정 액션만 WebSocket으로 전송
    if ([MSG.U_JOINED, MSG.U_SIGNED, MSG.U_REJECTED].includes(action.type)) {
      sendMsg(action.type, action.payload);
    }
  };

  // 탭 전환시 웹소켓 종료/복구. 메모리누수 방지
  const registerTabVisibilityHandler = () => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden") {
        console.debug("[TAB] 숨김 → WebSocket 종료");
        cleanupWebSockets();
      } else {
        console.debug("[TAB] 복귀 → WebSocket 재연결 및 상태 동기화");
        await initWebSocket();     // INIT_WS 재연결 및 최신 상태 동기화
        realtimeWebSocket();       // REALTIME_WS 재연결
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      cleanupWebSockets();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  };

  return { initWebSocket, realtimeWebSocket, cleanupWebSockets, sendMsg, createDispatchWithWebSocket, registerTabVisibilityHandler };
};
