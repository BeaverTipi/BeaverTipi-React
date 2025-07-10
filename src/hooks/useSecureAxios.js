import axios from "axios";
import { useContext, useMemo } from "react";
import { AESContext } from "../context/AESContext";
import CryptoJS from "crypto-js";

export function useSecureAxios() {
  const { encryptWithRandomIV, decryptWithIV } = useContext(AESContext);

  const secureAxios = useMemo(() => {
    const instance = axios.create();

    // 요청 인터셉터: 랜덤 IV 기반 암호화
    instance.interceptors.request.use(config => {
      if (config.data) {
        const { iv, encrypted } = encryptWithRandomIV(JSON.stringify(config.data));
        config.data = { iv, encrypted };
        config.headers["Content-Type"] = "application/json";
      }
      return config;
    }, error => Promise.reject(error));

    // 응답 인터셉터: 동적 IV 기반 복호화
    instance.interceptors.response.use(response => {
      const { iv, encrypted } = response.data || {};
      if (iv && encrypted) {
        try {
          const decrypted = decryptWithIV(encrypted, iv);
          response.data = JSON.parse(decrypted);
        } catch (e) {
          console.error("[복호화 실패]", e);
        }
      }
      return response.data;
    }, error => Promise.reject(error));

    return instance;
  }, [encryptWithRandomIV, decryptWithIV]);

  return secureAxios;
}
