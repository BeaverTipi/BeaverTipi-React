import React, { createContext, useContext } from 'react';
import axios from 'axios';
/*
 * Authorization 에서 사용될 jwt 토큰 인터셉터 내장. 
 * Axios 사용 시, rest url mapping 적용
 * => 각 컴포넌트에서 다음과 같이 불러오고 사용.
 * ```
 *  const axios = useAxios();
 *  axios.get("/lstg").then(...);
 * ```
 * 
 */
const AxiosContext = createContext(null);

export function AxiosProvider({ children }) {

  const SPRING_URL_ORIGIN = "http://localhost:80";
  const SPRING_URL_PREFIX = "/rest/myoffice";
  const myofficeAPI = axios.create({
    baseURL: SPRING_URL_ORIGIN
    , headers: {
      "Content-Type": "application/json"
    }
    , withCredentials: true
  });

  // // 서버에 요청 보내기 전에 실행되는 필터(interceptor)
  // myofficeAPI.interceptors.request.use(
  //   config => {
  //     const token = localStorage.getItem("JWT-TOKEN");

  //     if (token) config.headers.Authorization = `Bearer ${token}`;
  //     console.log("[요청승인]", config.method?.toUpperCase(), config.url);

  //     return config; // 쿠키에 token이 존재할 때, config 내에 반영시켜 비동기 요청 전송
  //   },
  //   error => {
  //     console.error("[요청에러]", error);
  //     return Promise.reject(error); //오류를 그대로 던져서 catch문으로 넘김
  //   }
  // );

  // 서버에서 응답을 받자마자 실행되는 필터(interceptor)
  // myofficeAPI.interceptors.response.use(
  //   resp => {
  //     console.log("[응답승인]", resp.status, resp.config.url);
  //     return resp.data;
  //   },
  //   error => { //<-응답으로 에러를 받았다면,

  //     if (error.response?.status === 401) {
  //       alert("세션이 만료! 재로그인 갑시다.");
  //       window.location.href = SPRING_URL_ORIGIN;
  //     }

  //     console.error("[응답에러]", error);
  //     return Promise.reject(error);
  //   }
  // );

  return (
    <AxiosContext.Provider value={myofficeAPI}>
      {children}
    </AxiosContext.Provider>
  );
};

export const useAxios = () => useContext(AxiosContext);