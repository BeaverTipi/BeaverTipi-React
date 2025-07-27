/*
[ContractSignature]
└─ useReducer(contractSignatureReducer)
└─ state.signers         ← 서명자 리스트 (서명/거절/검증 포함)
└─ state.signerInfo      ← 현재 나 (로그인한 사용자)의 signer 객체
└─ state.pdfData         ← 계약서 메타
└─ state.signatureStatus ← LESSEE, LESSOR 등의 서명 상태만 저장
└─ state.loading / error

signers: {
  status: "U_..."",
  role: "AGENT" | "LESSOR" | "LESSEE",
  mbrCd?: string,
  name: string,
  telno?: string,
  id: string,
  signedAt: string | null,
  hashVal: string | null,
  ipAddr: string,
  isValid: boolean,
  isRejected: boolean,
  }
  */

export const MSG = {
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
  SET_TEMP_PDF_FILE_ID: "TEMP_PDF_FILE_ID",
  SET_PDF_DATA: "PDF_DATA",
  SET_CONT_ID: "CONT_ID",
  SET_INIT_REQUEST: "INIT_REQUEST",
  SET_INIT_RESPONSE: "INIT_RESPONSE",
};

export const ROLE = {
  LESSEE: "LESSEE",
  LESSOR: "LESSOR",
  AGENT: "AGENT",
};

export const initialSignatureState = {
  contId: "",
  loading: true,
  error: null,
  signers: [], // { role, name, connected, signedAt, isValid, isRejected, tempPdfUrl }
  signerInfo: {},
  pdfData: null,
  tempPdfUrl: null,
  tempPdfFileIds: [],
  signatureStatus: {}, // ← 요거!
};

export function contractSignatureReducer(state, action) {
  const { type, role, payload } = action;
  //방어 코드: 예기치 못한 공백 메시지 전파 확인용 로그
  if (
    payload === null ||
    payload === undefined ||
    (typeof payload !== "object" && !Array.isArray(payload))
  ) {
    console.warn(
      "❌ 잘못된 WebSocket payload 수신:\n type::",
      type,
      "\n payload",
      payload
    );
    return state;
  }
  //인가, 웹소켓 수신 이벤트로 갱신되는 리듀서
  switch (type) {
    case MSG.U_JOINED: {
      // console.log("[REDUCER] U_JOINED 발생, payload =", payload);
      // return {
      //   ...state,
      //   contId: payload.contId || state.contId,
      //   signerInfo: payload,
      //   signers:
      //     state.signers.length === 0
      //       ? [payload]
      //       : state.signers.map((userInfo) =>
      //           userInfo.role === payload.role &&
      //           (userInfo.id === payload.id || userInfo.code === payload.code)
      //             ? { ...userInfo, ...payload }
      //             : userInfo
      //         ),
      // };
      const isSame = state.signers.some(
        (s) =>
          s.role === payload.role &&
          (s.id === payload.id || s.code === payload.code) &&
          s.status === payload.status &&
          s.connected === payload.connected &&
          s.signedAt === payload.signedAt
      );

      if (isSame) {
        return state; // 상태 변경 없음 → 렌더링 방지
      }

      const updatedSigners = state.signers.map((s) =>
        s.role === payload.role &&
        (s.id === payload.id || s.code === payload.code)
          ? { ...s, ...payload }
          : s
      );

      const isMe =
        payload.role === state.signerInfo.role &&
        (payload.id === state.signerInfo.id ||
          payload.code === state.signerInfo.code);

      return {
        ...state,
        contId: payload.contId || state.contId,
        signers: updatedSigners,
        signerInfo: isMe
          ? { ...state.signerInfo, ...payload }
          : state.signerInfo,
      };
    }
    case MSG.U_SIGNED:
    case MSG.U_REJECTED:
    case MSG.U_DISCONNECTED:
      return {
        ...state,
        signers: state.signers.map((userInfo) =>
          userInfo.role === role &&
          (userInfo.id === payload.id || userInfo.code === payload.code)
            ? { ...userInfo, ...payload }
            : userInfo
        ),
      };

    case MSG.SET_ERROR:
      return { ...state, error: payload };

    case MSG.SET_LOADING:
      return { ...state, loading: payload };

    case MSG.SET_SIGNER_INFO: {
      if (!payload?.role || !payload?.name) {
        console.log("[SIGNER_INFO] 실패: 불완전한 payload\n payload:", payload);
        return state;
      }

      const updatedSignerInfo = {
        ...payload,
        // fallback: 기존 status 유지
        status: payload.status || state.signerInfo.status || null,
      };

      const updatedSigners =
        state.signers.length === 0
          ? [updatedSignerInfo]
          : state.signers.map((userInfo) =>
              userInfo.role === updatedSignerInfo.role &&
              (userInfo.code === updatedSignerInfo.code ||
                userInfo.id === updatedSignerInfo.id)
                ? { ...userInfo, ...updatedSignerInfo }
                : userInfo
            );

      return {
        ...state,
        signerInfo: updatedSignerInfo,
        signers: updatedSigners,
      };
    }

    case MSG.SET_SIGNERS: {
      const updatedSignerInfo = state.signerInfo;
      const updatedList = payload;

      // 만약 signerInfo의 id가 payload 안에 있다면,
      // 동기화 한번 해줄 수 있음
      const matchingUser = updatedList.find(
        (u) =>
          u.role === updatedSignerInfo.role &&
          (u.code === updatedSignerInfo.code || u.id === updatedSignerInfo.id)
      );

      return {
        ...state,
        signers: payload,
        signerInfo: matchingUser || updatedSignerInfo, // fallback
      };
    }

    case MSG.SET_SIGNED_AT: {
      const now = payload;

      const updatedSignerInfo = {
        ...state.signerInfo,
        signedAt: now,
        status: MSG.U_SIGNED,
      };

      // signers 리스트 내 사용자도 서명시각 반영
      const updatedSigners = state.signers.map((userInfo) =>
        userInfo.role === updatedSignerInfo.role &&
        (userInfo.code === updatedSignerInfo.code ||
          userInfo.id === updatedSignerInfo.id)
          ? { ...userInfo, signedAt: now, status: MSG.U_SIGNED }
          : userInfo
      );

      return {
        ...state,
        signerInfo: updatedSignerInfo,
        signers: updatedSigners,
      };
    }

    case MSG.SET_SIGNATURE_STATUS: {
      const updatedStatusMap = payload;
      const updatedSigners = state.signers.map((userInfo) => {
        const lowerRole = userInfo.role?.toLowerCase();
        return updatedStatusMap[lowerRole]
          ? { ...userInfo, status: updatedStatusMap[lowerRole] }
          : userInfo;
      });

      const myRole = state.signerInfo.role?.toLowerCase();
      const updatedStatus = updatedStatusMap[myRole] || state.signerInfo.status;

      return {
        ...state,
        signatureStatus: updatedStatusMap,
        signerInfo: {
          ...state.signerInfo,
          status: updatedStatus,
        },
        signers: updatedSigners,
      };
    }

    case MSG.SET_TEMP_PDF_URL:
      return { ...state, tempPdfUrl: payload };

    case MSG.SET_TEMP_PDF_FILE_ID:
      return {
        ...state,
        tempPdfFileIds: state.tempPdfFileIds.includes(payload)
          ? state.tempPdfFileIds
          : [...state.tempPdfFileIds, payload],
      };

    case MSG.SET_PDF_DATA:
      return { ...state, pdfData: payload };

    case MSG.SET_CONT_ID:
      return {
        ...state,
        contId: payload,
      };
    ///→ SET_SIGNED_AT: signerInfo.signedAt만 바뀜, signers[]는 그대로
    default:
      console.warn("[Reducer] Unknown action type:", type);
      return state;
  }
}
