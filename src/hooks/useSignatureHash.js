import { useCallback } from "react";
import sha256 from "crypto-js/sha256";

/**
 * 전자서명 위변조 방지 해시를 생성하는 Hook
 * @returns {Function} 해시 생성 함수
 */
export function useSignatureHash() {
  /**
   * SHA-256 해시 생성 함수
   * @param {Object} param0
   * @param {string} param0.base64Image
   * @param {string} param0.telno
   * @param {string} param0.contId
   * @param {string} param0.role
   * @param {string} param0.signedAt
   * @returns {string} SHA-256 해시값 (hex)
   */
  const createHash = useCallback(
    ({ base64Image, telno, contId, role, signedAt }) => {
      const plain = base64Image + telno + contId + role + signedAt;
      return sha256(plain).toString(); // hex
    },
    []
  );

  return createHash;
}
