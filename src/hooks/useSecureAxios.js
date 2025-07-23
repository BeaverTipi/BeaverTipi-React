import axios from "axios";
import { useContext, useMemo } from "react";
import { AESContext } from "../context/AESContext";
import CryptoJS from "crypto-js";

const BACKEND_PORT = 80;
const PROTOCOL = window.location.protocol; // 'http:'
const HOSTNAME = window.location.hostname; // 'localhost' 또는 '192.168.x.x'
const PREFIX = "/rest/broker/myoffice";

export function useSecureAxios(options = {}) {
  const {
    prefix = PREFIX,
    port = BACKEND_PORT,
    protocol = PROTOCOL,
    hostname = HOSTNAME,
    headers = {},
  } = options;

  const { encryptWithRandomIV, decryptWithIV } = useContext(AESContext);
  const baseURL = `${protocol}//${hostname}:${port}${prefix}`;
  const secureAxios = useMemo(() => {
    const instance = axios.create({
      baseURL: baseURL,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      withCredentials: true,
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
  }, [baseURL, encryptWithRandomIV, decryptWithIV]);

  return secureAxios;
}
