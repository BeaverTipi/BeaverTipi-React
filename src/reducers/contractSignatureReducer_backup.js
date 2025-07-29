/*
[전자서명 WebSocket 흐름]
INIT_WS 채널: 최초 연결 시 서명자 정보 조회
REALTIME_WS 채널: 실시간 상태 전파 (JOINED, SIGNED, REJECTED, COMPLETED)
Reducer 상태관리 흐름
DB 연동 (PDF 업로드 / 상태 저장 / 위조검증)

[INIT]
 └─ SET_CONT_ID
 └─ SET_SIGNER_INFO (나)
 └─ SET_SIGNERS (전체)

[INIT_WS 수신]
 └─ SET_SIGNERS (업데이트)

[REALTIME_WS 수신]
 ├─ U_JOINED   → SET_SIGNERS, SET_SIGNER_INFO (if me)
 ├─ U_SIGNED   → SET_SIGNERS, SET_SIGNER_INFO (if me)
 ├─ U_REJECTED → SET_SIGNERS, SET_SIGNER_INFO (if me)

[SIGN 완료]
 └─ SET_SIGNER_INFO + SET_SIGNATURE_STATUS + SET_SIGNED_AT
 └─ SEND SIGNED_TEMP1/2 → 최종이면 ALL_SIGNED

[서명 거절]
 └─ SET_SIGNER_INFO + SET_SIGNATURE_STATUS
 └─ SEND U_REJECTED

[서명 완료됨]
 └─ SET_PDF_DATA, SET_TEMP_PDF_URL, SET_TEMP_PDF_FILE_IDS


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

import React from "react";
import { normalizeSigner } from "../js/normalizeSigner";

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
  SET_TEMP_PDF_FILE_IDS: "TEMP_PDF_FILE_IDS",
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

function isValidContId(id) {
  return typeof id === "string" && /^CN\d{8,}$/.test(id);
}

function isValidSigner(signer) {
  return (
    typeof signer === "object" &&
    signer.name &&
    signer.role &&
    signer.id &&
    typeof signer.isValid === "boolean" &&
    typeof signer.isRejected === "boolean"
  );
}

function isValidSignerArray(arr) {
  return Array.isArray(arr) &&
    arr.length > 0 &&
    arr.every(
      (s) => !!s && typeof s === "object" && typeof s.name === "string"
    );
}

export function contractSignatureReducer(state, action) {
  const { type, role, payload } = action;
  // //방어 코드: 예기치 못한 공백 메시지 전파 확인용 로그
  // if (
  //   payload === null ||
  //   payload === undefined ||
  //   (typeof payload !== "object" && !Array.isArray(payload)) ||
  //   (type === MSG.SET_CONT_ID && (typeof payload !== "string" || !payload.startsWith("CN")))
  // ) {
  //   console.warn(
  //     "❌ 잘못된 WebSocket payload 수신:\n type::",
  //     type,
  //     "\n payload",
  //     payload
  //   );
  //   return state;
  // }
  //인가, 웹소켓 수신 이벤트로 갱신되는 리듀서
  switch (type) {
    case MSG.U_JOINED: {
      // if (!payload || typeof payload !== "object") {
      //   console.warn("❌ 잘못된 signer 구조 (object 아님):", payload);
      //   return state;
      // }

      const safePayload = {
        ...payload,
        isValid: typeof payload.isValid === "boolean" ? payload.isValid : true,
        isRejected: typeof payload.isRejected === "boolean" ? payload.isRejected : false,
      };

      const isMe =
        safePayload.role === state.signerInfo.role &&
        (safePayload.id === state.signerInfo.id || safePayload.code === state.signerInfo.code);

      const updatedSignerInfo = isMe
        ? {
          ...state.signerInfo,
          ...safePayload,
          connected: true,
        }
        : state.signerInfo;

      const updatedSigners = state.signers.map(s =>
        s.role === safePayload.role &&
          (s.id === safePayload.id || s.code === safePayload.code)
          ? { ...s, ...safePayload, connected: true }
          : s
      );

      const isSame =
        state.signerInfo === updatedSignerInfo &&
        JSON.stringify(state.signers) === JSON.stringify(updatedSigners);
      if (isSame) return state;

      return {
        ...state,
        contId: isValidContId(safePayload.contId) ? safePayload.contId : state.contId,
        signerInfo: updatedSignerInfo,
        signers: updatedSigners,
      };
    }

    case MSG.U_SIGNED:
    case MSG.U_REJECTED:
    case MSG.U_DISCONNECTED: {
      console.log("🔥 [REDUCER] signers updated...\n type:", type, "\n signer:", state.signers);
      const isMe =
        payload.role === state.signerInfo.role &&
        (payload.id === state.signerInfo.id || payload.code === state.signerInfo.code);
      return {
        ...state,
        signerInfo: isMe ? { ...state.signerInfo, ...payload } : state.signerInfo,
      };
    }
    case MSG.SET_ERROR:
      return { ...state, error: payload };

    case MSG.SET_LOADING:
      return { ...state, loading: typeof payload === "boolean" ? payload : !!payload?.loading };

    case MSG.SET_SIGNER_INFO: {
      // if (!isValidSigner(payload)) {
      //   console.warn("[::SET_SIGNER_INFO] 잘못된 signerInfo: ", payload);
      //   return state;
      // }
      console.log("[REDUCER] SET_SIGNER_INFO: ", payload);
      const updatedSignerInfo = {
        ...payload,
        status: payload.status || state.signerInfo.status || null,
        connected: payload.connected ?? state.signerInfo.connected ?? true,
      };
      const updatedSigners =
        state.signers.length === 0
          ? [updatedSignerInfo]
          : state.signers.map((userInfo) =>
            userInfo.role === updatedSignerInfo.role &&
              (userInfo.code === updatedSignerInfo.code || userInfo.id === updatedSignerInfo.id)
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
      const normalized = (Array.isArray(payload) ? payload : []).map(normalizeSigner);

      // if (!isValidSignerArray(normalized)) {
      //   console.warn("[::SET_SIGNERS] signers 배열이 유효치 않음: ", payload);
      //   return state;
      // }
      if (!Array.isArray(payload) || payload.length === 0) {
        console.warn("🚫 SET_SIGNERS 무시됨: payload 비어있음");
        return state;
      }
      console.log("[REDUCER] SET_SIGNERS: ", normalized);
      const updatedList = normalized;
      const merged = updatedList.map(newUser => {
        const prev = state.signers.find(
          oldUser =>
            oldUser.role === newUser.role &&
            (oldUser.id === newUser.id || oldUser.code === newUser.code)
        );
        return {
          ...newUser,
          status: newUser.status || prev?.status || "JOINED",
          connected: prev?.connected ?? false,
        };
      });
      const current = state.signerInfo;
      const matchingUser = updatedList.find(
        userInfo =>
          userInfo.role === current?.role &&
          (userInfo.id === current?.id || userInfo.code === current?.code)
      );
      return {
        ...state,
        signers: merged,
        signerInfo: matchingUser
          ? { ...current, ...matchingUser }
          : current,
      };
    }

    case MSG.SET_SIGNED_AT: {
      const now = payload;
      // if (typeof now !== "string" && typeof now !== "number") {
      //   console.warn("[::SET_SIGNED_AT] 유효하지 않은 서명 시각: ", now);
      //   return state;
      // };
      console.log("[REDUCER] SET_SIGNED_AT: ", payload);
      const isMe = state.signerInfo?.role &&
        state.signers.some(
          s =>
            s.role === state.signerInfo.role &&
            (s.id === state.signerInfo.id || s.code === state.signerInfo.code)
        );
      if (!isMe) {
        console.warn("[::SET_SIGNED_AT] signerInfo가 signers 목록에 없음", state);
        return state;
      };
      const updatedSignerInfo = {
        ...state.signerInfo,
        signedAt: now,
        status: MSG.U_SIGNED,
      };
      const updatedSigners = state.signers.map(user =>
        user.role === updatedSignerInfo.role &&
          (user.id === updatedSignerInfo.id || user.code === updatedSignerInfo.code)
          ? { ...user, signedAt: now, status: MSG.U_SIGNED }
          : user
      );
      return {
        ...state,
        signerInfo: updatedSignerInfo,
        signers: updatedSigners,
      };
    }

    case MSG.SET_SIGNATURE_STATUS: {
      const updatedStatusMap = payload;
      // if (
      //   !updatedStatusMap ||
      //   typeof updatedStatusMap !== "object" ||
      //   Array.isArray(updatedStatusMap)
      // ) {
      //   console.warn("[::SET_SIGNATURE_STATUS] 잘못된 payload: ", payload);
      //   return state;
      // }
      console.log("[REDUCER] SET_SIGNATURE_STATUS: ", payload);
      const updatedSigners = state.signers.map(user => {
        const key = user.role?.toLowerCase?.();
        return updatedStatusMap[key]
          ? { ...user, status: updatedStatusMap[key] }
          : user;
      });
      const myRole = state.signerInfo?.role?.toLowerCase?.();
      const myUpdatedStatus = updatedStatusMap[myRole] || state.signerInfo.status;
      const updatedSignerInfo = {
        ...state.signerInfo,
        status: myUpdatedStatus,
      };
      return {
        ...state,
        signatureStatus: updatedStatusMap,
        signerInfo: updatedSignerInfo,
        signers: updatedSigners,
      };
    }

    case MSG.SET_TEMP_PDF_URL: {
      if (typeof payload !== "string" || !payload.startsWith("blob:")) {
        console.warn("[::SET_TEMP_PDF_URL] 잘못된 URL 형식: ", payload);
        return state;
      };
      console.log("[REDUCER] SET_TEMP_PDF_URL: ", payload);
      return {
        ...state,
        tempPdfUrl: payload,
      };
    }

    case MSG.SET_TEMP_PDF_FILE_IDS: {
      // if (typeof payload !== "string") {
      //   console.warn("[::SET_TEMP_PDF_FILE_IDS] fileId는 문자열이어야 함: ", payload);
      //   return state;
      // }
      console.log("[REDUCER] SET_TEMP_PDF_FILE_IDS: ", payload);
      const isDuplicated = state.tempPdfFileIds.includes(payload);
      return {
        ...state,
        tempPdfFileIds: isDuplicated
          ? state.tempPdfFileIds
          : [...state.tempPdfFileIds, payload],
      };
    }

    case MSG.SET_PDF_DATA: {
      // if (
      //   !payload ||
      //   typeof payload !== "object" ||
      //   typeof payload.name !== "string" ||
      //   typeof payload.createdAt !== "string"
      // ) {
      //   console.warn("[::SET_PDF_DATA] 잘못된 메타 정보: ", payload);
      //   return state;
      // };
      console.log("[REDUCER] SET_PDF_DATA: ", payload);
      return {
        ...state,
        pdfData: payload,
      };
    }

    case MSG.SET_CONT_ID: {
      // if (!isValidContId(payload)) {
      //   console.warn("[::SET_CONT_ID] 잘못된 계약 ID: ", payload);
      //   return state;
      // }
      console.log("[REDUCER] SET_CONT_ID: ", payload);
      return {
        ...state,
        contId: payload,
      };
    }

    /* SET_INIT_REQUEST Message Structure ^0^
    {
      "type": "INIT_REQUEST",
      "contId": "CN250724007",
      "role": "AGENT",
      "payload": [
        {
          "contId": "CN250724007",
          "role": "AGENT",
          "code": "M2507000110",
          "id": "openthatsodapop",
          "name": "진우",
          "telno": "010-1111-2222",
          "ipAddr": "121.183.211.252",
          "status": "JOINED",
          "signedAt": null,
          "hashVal": null,
          "isValid": true,
          "isRejected": false,
          "connected": true
        },
        {
          "contId": "CN250724007",
          "role": "LESSOR",
          "code": "M2507000015",
          "id": "manual_user_08",
          "name": "새회원3",
          "telno": "01088880008",
          "ipAddr": "1.245.228.194",
          "status": "JOINED",
          "signedAt": null,
          "hashVal": null,
          "isValid": true,
          "isRejected": false,
          "connected": false
        }
        // ... 나머지 서명자들도 포함
      ]
    }
    */
    case MSG.SET_INIT_REQUEST: {
      // 특별한 상태 변화는 없음. 필요시 로그만 출력
      console.log("📡 INIT 요청 발송됨:", payload);
      return state;
    }

    case MSG.SET_INIT_RESPONSE: {
      // if (!isValidSignerArray(payload)) {
      //   console.warn("❌ SET_INIT_RESPONSE: 유효하지 않은 signers 배열", payload);
      //   return state;
      // }

      const myRole = state.signerInfo?.role ?? "UNKNOWN";

      // 내 역할은 제외하고 다른 역할만 업데이트
      const updatedOthers = payload
        .filter(user => user.role !== myRole)
        .map(newUser => {
          const prev = state.signers.find(
            oldUser =>
              oldUser.role === newUser.role &&
              (oldUser.id === newUser.id || oldUser.code === newUser.code)
          );
          return {
            ...newUser,
            connected: prev?.connected ?? false,
          };
        });

      const untouchedMine = state.signers.filter(s => s.role === myRole);
      const merged = [...untouchedMine, ...updatedOthers];

      return {
        ...state,
        signers: merged,
      };
    }


    default: {
      console.warn("[REDUCER::DEFAULT] Unknown action type:", type, "\n payload:", payload);
      return state;
    }
  }
}
