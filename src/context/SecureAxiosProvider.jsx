import React, { useContext, useMemo, useRef, } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { AESContext } from "../context/AESContext";
import { SecureAxiosContext } from "./SecureAxiosContext";

export const SecureAxiosProvider = ({ children }) => {
  const { encryptWithRandomIV, decryptWithIV } = useContext(AESContext);
  const navigate = useNavigate();
  const secureAxiosInstance = useMemo(() => {

    const BACKEND_PORT = 80;
    const PROTOCOL = window.location.protocol;
    let HOSTNAME = window.location.hostname;
    if (HOSTNAME === "react.beavertipi.com") HOSTNAME = "beavertipi.com";
    if (HOSTNAME === "dev.beavertipi.com") HOSTNAME = "dev1.beavertipi.com";
    if (HOSTNAME === "hbdev.beavertipi.com") HOSTNAME = "hbdev1.beavertipi.com";

    const SPRING_URL_ORIGIN = `${PROTOCOL}//${HOSTNAME}`;
    const SPRING_URL_PREFIX = "/rest/broker/myoffice";

    const instance = axios.create({
      baseURL: SPRING_URL_ORIGIN + SPRING_URL_PREFIX,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });

    // 요청 인터셉터: 랜덤 IV 기반 암호화
    instance.interceptors.request.use(
      (config) => {
        const { iv, encrypted } = encryptWithRandomIV(JSON.stringify(config.data));
        config.data = { iv, encrypted };
        config.headers["Content-Type"] = "application/json";
        console.log(
          `%c[요청승인]`,
          "color:green; font-weight:bold;",
          config.method?.toUpperCase(),
          config.url,
          config.baseURL,
          SPRING_URL_PREFIX
        );
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터: 동적 IV 기반 복호화
    instance.interceptors.response.use(
      (response) => {
        if (response.status === 401) navigate("/signin");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encryptWithRandomIV, decryptWithIV, navigate]);

  if (!secureAxiosInstance) return null; // 로딩 중일 경우 차단

  return (
    <SecureAxiosContext.Provider value={secureAxiosInstance}>
      {children}
    </SecureAxiosContext.Provider>
  );
};
