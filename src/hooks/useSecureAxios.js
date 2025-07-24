import axios from "axios";
import { useContext, useMemo } from "react";
import { AESContext } from "../context/AESContext";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router";

export function useSecureAxios(prefix) {
  const navigate = useNavigate();
  const { encryptWithRandomIV, decryptWithIV } = useContext(AESContext);
  const BACKEND_PORT = 80;
  const PROTOCOL = window.location.protocol; // 'http:' or 'https:'

  let HOSTNAME = window.location.hostname;   // e.g., react.beavertipi.com

  // 👉 react 서브도메인 접근 시 백엔드는 beavertipi.com 사용
  if (HOSTNAME === "react.beavertipi.com") {
    HOSTNAME = "beavertipi.com";
  }
  if (HOSTNAME === "dev.beavertipi.com") {
    HOSTNAME = "dev1.beavertipi.com";
  }
  if (HOSTNAME === "hbdev.beavertipi.com") {
    HOSTNAME = "hbdev1.beavertipi.com";
  }
  const SPRING_URL_ORIGIN = `${PROTOCOL}//${HOSTNAME}`;
  const SPRING_URL_PREFIX = prefix ? prefix : "/rest/broker/myoffice";

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
    instance.interceptors.request.use(
      (config) => {
        const { iv, encrypted } = encryptWithRandomIV(
          JSON.stringify(config.data)
        );
        config.data = { iv, encrypted };
        config.headers["Content-Type"] = "application/json";

        console.log(
          `%c[요청승인]`,
          "color:green; font-weight:bold;",
          config.method?.toUpperCase(),
          config.url
        );
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터: 동적 IV 기반 복호화
    instance.interceptors.response.use(
      (response) => {
        if (response.status == 401) navigate("/signin")
        const { iv, encrypted } = response.data || {};
        if (iv && encrypted) {
          try {
            const decrypted = decryptWithIV(encrypted, iv);
            response.data = JSON.parse(decrypted);
            console.log(
              `%c[응답 ✅]`,
              "color: dodgerblue; font-weight: bold;",
              response.config?.url,
              response.data
            );
          } catch (e) {
            console.error(
              "%c[복호화 실패]",
              "color: darkred; font-weight: bold;",
              e
            );
          }
        }
        return response.data;
      },
      (error) => Promise.reject(error)
    );

    return instance;
  }, [encryptWithRandomIV, decryptWithIV]);

  return secureAxios;
}
