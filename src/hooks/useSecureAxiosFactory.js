
import { useContext, useRef } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { AESContext } from "../context/AESContext";
const instanceCache = new Map();



// 전역 캐시를 React ref로 유지
export const useSecureAxiosFactory = ({ maxAgeMs = 5 * 60 * 1000, retryCount = 2 } = {}) => {
  const { encryptWithRandomIV, decryptWithIV } = useContext(AESContext);
  const navigate = useNavigate();

  return (prefix) => {
    const now = Date.now();
    const cached = instanceCache.get(prefix);

    // 캐시 만료 검사
    if (cached && now - cached.createdAt < maxAgeMs) {
      return cached.instance;
    }

    const PROTOCOL = window.location.protocol;
    let HOSTNAME = window.location.hostname;

    if (HOSTNAME === "react.beavertipi.com") HOSTNAME = "beavertipi.com";
    if (HOSTNAME === "dev.beavertipi.com") HOSTNAME = "dev1.beavertipi.com";
    if (HOSTNAME === "hbdev.beavertipi.com") HOSTNAME = "hbdev1.beavertipi.com";

    const SPRING_URL_ORIGIN = `${PROTOCOL}//${HOSTNAME}`;
    const SPRING_URL_PREFIX = prefix;

    const instance = axios.create({
      baseURL: SPRING_URL_ORIGIN + SPRING_URL_PREFIX,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });

    // 요청 인터셉터 (암호화 + 토큰 삽입)
    instance.interceptors.request.use(
      (config) => {
        const { iv, encrypted } = encryptWithRandomIV(JSON.stringify(config.data));
        config.data = { iv, encrypted };

        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터 (복호화 + 자동 재시도 + 리프레시)
    instance.interceptors.response.use(
      async (response) => {
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
      },
      async (error) => {
        const originalRequest = error.config;

        // 자동 재시도
        if (!originalRequest._retryCount) originalRequest._retryCount = 0;
        if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
          if (originalRequest._retryCount < retryCount) {
            originalRequest._retryCount++;
            return instance(originalRequest);
          }
        }

        // 리프레시 토큰
        if (error.response?.status === 401 && !originalRequest._retryAfterRefresh) {
          originalRequest._retryAfterRefresh = true;
          try {
            const { data } = await axios.post(`${SPRING_URL_ORIGIN}/auth/refresh`, {}, { withCredentials: true });
            localStorage.setItem("accessToken", data.accessToken);
            originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
            return instance(originalRequest); // 재시도
          } catch (refreshError) {
            console.warn("[토큰 재발급 실패]", refreshError);
            navigate("/signin");
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // 캐시 저장
    instanceCache.set(prefix, { instance, createdAt: now });

    return instance;
  };
};