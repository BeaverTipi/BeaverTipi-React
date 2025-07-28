import React from "react";
/**
 * signer 객체를 안전하게 정규화(normalize)해주는 유틸 함수
 * "", 0, false 는 검증 통과 대상.
 * null, undefined, NaN 대응 가능
 * @param {Object} raw - 원본 signer 데이터
 * @returns {Object} - 정규화된 signer 객체
 */
// export function normalizeSigner(raw = {}) {
//   if (!raw || typeof raw !== 'object') {
//     console.warn("[NORMALIZE_SIGNER] 입력이 객체 아님:", raw);
//     return null;
//   }

//   const required = ["role", "code", "id", "name"];
//   const isInvalid = v => v === null || v === undefined || Number.isNaN(v);
//   const contId = isInvalid(raw.contId) ? "UNKNOWN_CONTID" : raw.contId;
//   const role = isInvalid(raw.role) ? "UNKNOWN_ROLE" : raw.role;
//   const code = isInvalid(raw.code) ? (raw.mbrCd ?? "UNKNOWN_CODE") : raw.code;
//   const id = isInvalid(raw.id) ? (raw.mbrId ?? "UNKNOWN_ID") : raw.id;
//   const name = isInvalid(raw.name) ? (raw.mbrNm ?? "이름없음") : raw.name;
//   const telno = isInvalid(raw.telno) ? "" : raw.telno;
//   // if (!contId || !role || !id || !code || !name || !telno) {
//   //   console.warn("[NOMARLIZE_SIGNER]유효하지 않은 signer 구조:", raw);
//   //   return null; //null 리턴하면 map/filter에서 제거.
//   // }
//   // ✅ 필수 필드 누락 시 null 반환 (telno는 제외)
//   if ([contId, role, code, id, name].some(v => v.startsWith("UNKNOWN"))) {
//     console.warn("[NORMALIZE_SIGNER] 유효하지 않은 signer 구조:", raw);
//     return null;
//   }

//   return {
//     contId,
//     role,
//     code,
//     id,
//     name,
//     telno,
//     ipAddr: isInvalid(raw.ipAddr) ? "" : raw.ipAddr,
//     status: isInvalid(raw.status) ? "JOINED" : raw.status,
//     signedAt: isInvalid(raw.signedAt) ? "" : raw.signedAt,
//     hashVal: isInvalid(raw.hashVal) ? "" : raw.hashVal,
//     isValid: typeof raw.isValid === "boolean" ? raw.isValid : true,
//     isRejected: typeof raw.isRejected === "boolean" ? raw.isRejected : false,
//     connected: typeof raw.connected === "boolean" ? raw.connected : false,
//   };
// }



// export function normalizeSigner(raw = {}) {
//   if (!raw || typeof raw !== "object") {
//     console.warn("[NORMALIZE_SIGNER] 입력이 객체 아님:", raw);
//     return null;
//   }

//   const required = ["role", "code", "id", "name"];
//   const isInvalid = required.some((key) => raw[key] == null);
//   if (isInvalid) {
//     console.warn("[NORMALIZE_SIGNER] 유효하지 않은 signer 구조:", raw);
//     return null;
//   }

//   return {
//     contId: raw.contId ?? "UNKNOWN_CONTID",
//     status: raw.status ?? "UNKNOWN",
//     role: raw.role,
//     code: raw.code,
//     id: raw.id,
//     name: raw.name,
//     telno: raw.telno ?? null,
//     ipAddr: raw.ipAddr ?? null,
//     hashVal: raw.hashVal ?? null,
//     signedAt: raw.signedAt ?? null,
//     isValid: raw.isValid ?? null,
//     isRejected: raw.isRejected ?? false,
//     tempPdfUrl: raw.tempPdfUrl ?? null,
//     connected: raw.connected ?? false,
//   };
// }




export function normalizeSigner(raw) {
  if (!raw || typeof raw !== "object") return null;

  return {
    contId: raw.contId ?? null,
    role: raw.role ?? raw.contDtSignType ?? null,
    id: raw.id ?? raw.mbrId ?? null,
    code: raw.code ?? raw.mbrCd ?? null,
    name: raw.name ?? raw.mbrNm ?? null,
    telno: raw.telno ?? null,
    ipAddr: raw.ipAddr ?? null,
    signedAt: raw.signedAt ?? raw.contDtSignDtm ?? null,
    hashVal: raw.hashVal ?? raw.contDtSignHashVal ?? null,
    isValid: raw.isValid ?? true,
    isRejected: raw.isRejected ?? false,
    connected: raw.connected ?? false,
    status: raw.status ?? null,
    base64: raw.base64 ?? null,
    tempPdfUrl: raw.tempPdfUrl ?? null,
  };
}
