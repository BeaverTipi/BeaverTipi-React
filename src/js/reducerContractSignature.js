import React from "react";
export const ROLE = {
  LESSEE: "LESSEE",
  LESSOR: "LESSOR",
  AGENT: "AGENT",
};

export const MSG = {
  //INITIAL_SETTER
  INIT_REQUEST: "INIT_REQUEST",
  INIT_RESPONSE: "INIT_RESPONSE",
  //USER_EVENT
  U_JOINED: "U_JOINED",
  U_SIGNED: "U_SIGNED",
  U_REJECTED: "U_REJECTED",
  //SIGNATURE_PROCESS
  P_NOT_YET: "P_NOT_YET", //---STATE
  P_LESSOR_SIGNED: "P_LESSOR_SIGNED",
  P_LESSOR_REJECTED: "P_LESSOR_REJECTED",
  P_LESSEE_SIGNED: "P_LESSEE_SIGNED",
  P_LESSEE_REJECTED: "P_LESSEE_REJECTED",
  P_AGENT_SIGNED: "P_AGENT_SIGNED",
  P_AGENT_REJECTED: "P_AGENT_REJECTED",
  P_ALL_SIGNED: "P_CONCLUSION",
  //REDUCER_SETTER
  RESET: "RESET",
  SET_CONT_ID: "SET_CONT_ID",
  SET_SIGNERS_LESSEE: "SET_SIGNERS_LESSEE",
  SET_SIGNERS_LESSOR: "SET_SIGNERS_LESSOR",
  SET_SIGNERS_AGENT: "SET_SIGNERS_AGENT",
  SET_SIGNATURE_ORIGIN: "SET_SIGNATURE_ORIGIN",
  SET_SIGNATURE_LESSOR: "SET_SIGNATURE_LESSOR",
  SET_SIGNATURE_LESSEE: "SET_SIGNATURE_LESSEE",
  SET_SIGNATURE_AGENT: "SET_SIGNATURE_AGENT",
}

export const initialState = {
  signature: {
    contId: "",
    signatureStatus: "", //P_NOT_YET|...
    originalPdfData: "",
    lessorSignedPdfData: "",
    lessorSignedPdfId: "",
    lessorSignedPdfPath: "",
    lesseeSignedPdfData: "",
    lesseeSignedPdfId: "",
    lesseeSignedPdfPath: "",
    agentSignedPdfData: "",
    agentSignedPdfId: "",
    agentSignedPdfPath: "",
  },
  signers: {
    LESSOR: {
      contId: "",
      role: "",
      code: "",
      id: "",
      name: "",
      telno: "",
      signerStatus: "", // U_JOINED|...
      ipAddr: "",
      isJoined: false,
      signedAt: null, //SIGNED|REJECTED 시각
      isSigned: false,
      hashVal: "",
      isValid: false, //hashVal이 blank 아니면서 isValid false일 때 위변조 의심
      base64: "",
    },
    LESSEE: {
      contId: "",
      role: "",
      code: "",
      id: "",
      name: "",
      telno: "",
      signerStatus: "", // U_JOINED|...
      ipAddr: "",
      isJoined: false,
      signedAt: null, //SIGNED|REJECTED 시각
      isSigned: false,
      hashVal: "",
      isValid: false, //hashVal이 blank 아니면서 isValid false일 때 위변조 의심
      base64: "",
    },
    AGENT: {
      contId: "",
      role: "",
      code: "",
      id: "",
      name: "",
      telno: "",
      signerStatus: "", // U_JOINED|...
      ipAddr: "",
      isJoined: false,
      signedAt: null, //SIGNED|REJECTED 시각
      isSigned: false,
      hashVal: "",
      isValid: false, //hashVal이 blank 아니면서 isValid false일 때 위변조 의심
      base64: "",
    },
  },
}

export function contractSignatureReducer(state, action) {
  const { type, payload } = action;
  switch (type) {
    case MSG.RESET: {
      const { signature, signers } = payload;
      const mergedSigners = mergeSignersWithInitial(signers);
      const signatureStatus = calculateSignatureStatus(mergedSigners);
      return {
        ...state,
        signature: {
          ...state.signature,
          contId: signature?.contId ?? state.signature.contId,
          signatureStatus: signatureStatus,
          originalPdfData: signature?.originalPdfData ?? "",
          lessorSignedPdfData: signature?.lessorSignedPdfData ?? "",
          lessorSignedPdfId: signature?.lessorSignedPdfId ?? "",
          lessorSignedPdfPath: signature?.lessorSignedPdfPath ?? "",
          lesseeSignedPdfData: signature?.lesseeSignedPdfData ?? "",
          lesseeSignedPdfId: signature?.lesseeSignedPdfId ?? "",
          lesseeSIgnedPdfPath: signature?.lesseeSIgnedPdfPath ?? "",
          agentSignedPdfData: signature?.agentSignedPdfData ?? "",
          agendSignedPdfId: signature?.agendSignedPdfId ?? "",
          agentSignedPdfPath: signature?.agentSignedPdfPath ?? "",
        },
        signers: mergedSigners,
      }
    };
    case MSG.SET_SIGNERS_LESSOR: {
      if (state.signature.contId !== payload.contId) {
        console.warn("위조된 계약 정보(ID)");
      }
      return {
        ...state,
        signature: {
          ...state.signature,
          lessorSignedPdfId: payload.tempPdfId,
          lessorSignedPdfUrl: payload.tempPdfUrl,
        },
        signers: {
          ...state.signers,
          LESSOR: {
            ...state.signers.LESSOR,
            signerStatus: payload.signerStatus,
            signedAt: payload.signedAt,
            isSigned: payload.isSigned,
            hashVal: payload.hashVal
          },
        }
      };
    }
    case MSG.SET_SIGNERS_LESSEE: {
      if (state.signature.contId !== payload.contId) {
        console.warn("위조된 계약 정보(ID)");
      }
      return {
        ...state,
        signature: {
          ...state.signature,
          lesseeSignedPdfId: payload.tempPdfId,
          lesseeSignedPdfUrl: payload.tempPdfUrl,
        },
        signers: {
          ...state.signers,
          LESSEE: {
            ...state.signers.LESSEE,
            signerStatus: payload.signerStatus,
            signedAt: payload.signedAt,
            isSigned: payload.isSigned,
            hashVal: payload.hashVal
          },
        }
      };
    }
    case MSG.SET_SIGNERS_AGENT: {
      if (state.signature.contId !== payload.contId) {
        console.warn("위조된 계약 정보(ID)");
      }
      return {
        ...state,
        signature: {
          ...state.signature,
          agentSignedPdfId: payload.tempPdfId,
          agentSignedPdfUrl: payload.tempPdfUrl,
        },
        signers: {
          ...state.signers,
          AGENT: {
            ...state.signers.AGENT,
            signerStatus: payload.signerStatus,
            signedAt: payload.signedAt,
            isSigned: payload.isSigned,
            hashVal: payload.hashVal
          },
        }
      };
    }
    // case MSG.SET_SIGNATURE_LESSOR: {}
    default:
      return state;
  }
}
/**
 * Signers 초기값과 병합
 * @param {object} signers 
*/
function mergeSignersWithInitial(signers) {
  return {
    LESSEE: { ...initialState.signers.LESSEE, ...(signers?.LESSEE || {}) },
    LESSOR: { ...initialState.signers.LESSOR, ...(signers?.LESSOR || {}) },
    AGENT: { ...initialState.signers.AGENT, ...(signers?.AGENT || {}) },
  };
}

/**
 * 모든 서명자 상태를 확인해서 계약 상태 계산
 * @param {object} signers 
 */
function calculateSignatureStatus(signers) {
  const allSigned = Object.values(signers).every(
    (s) => s.isSigned && !s.isRejected
  );
  const anyRejected = Object.values(signers).some((s) => s.isRejected);

  if (anyRejected) return "P_REJECTED";
  if (allSigned) return "P_ALL_SIGNED";
  return "P_NOT_YET";
}