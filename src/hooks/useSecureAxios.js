import axios from "axios";
import { useContext, useMemo } from "react";
import { AESContext } from "../context/AESContext";
import CryptoJS from "crypto-js";

export function useSecureAxios() {
  const { encryptWithRandomIV, decryptWithIV } = useContext(AESContext);
    const BACKEND_PORT = 80;
    const PROTOCOL = window.location.protocol; // 'http:'
    const HOSTNAME = window.location.hostname; // 'localhost' 또는 '192.168.x.x'
  const SPRING_URL_ORIGIN = HOSTNAME +"//"+ PROTOCOL +":"+ BACKEND_PORT;
  const SPRING_URL_PREFIX = "/rest/broker/myoffice";
  const secureAxios = useMemo(() => {
    const instance = axios.create({
      baseURL: SPRING_URL_ORIGIN + SPRING_URL_PREFIX
      , headers: {
        "Content-Type": "application/json"
        , "Accept": "application/json"
      }
      , withCredentials: true
    });

    // 요청 인터셉터: 랜덤 IV 기반 암호화
    instance.interceptors.request.use(config => {
      if (config.data) {
        const { iv, encrypted } = encryptWithRandomIV(JSON.stringify(config.data));
        config.data = { iv, encrypted };
        config.headers["Content-Type"] = "application/json";
      }
      console.log(`%c[요청승인]`, "color:green; font-weight:bold;", config.method?.toUpperCase(), config.url);
      return config;
    }, error => Promise.reject(error));

    // 응답 인터셉터: 동적 IV 기반 복호화
    instance.interceptors.response.use(response => {
      const { iv, encrypted } = response.data || {};
      if (iv && encrypted) {
        try {
          const decrypted = decryptWithIV(encrypted, iv);
          response.data = JSON.parse(decrypted);
          console.log(`%c[복호화된 응답 ✅]`, "color: dodgerblue; font-weight: bold;", response.config?.url, response.data);
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
