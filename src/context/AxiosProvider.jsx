import { AxiosContext } from './AxiosContext';
import axios from 'axios';

export function AxiosProvider({ children }) {

  const SPRING_URL_ORIGIN = "http://localhost";
  const SPRING_URL_PREFIX = "/rest/broker/myoffice";
  const myofficeAPI = axios.create({
    baseURL: SPRING_URL_ORIGIN + SPRING_URL_PREFIX
    , headers: {
      "Content-Type": "application/json"
      , "Accept": "application/json"
    }
    , withCredentials: true
  });

  //서버에 요청 보내기 전에 실행되는 필터(interceptor)
  myofficeAPI.interceptors.request.use(
    config => {
      const token = localStorage.getItem("JWT-TOKEN");

      if (token) config.headers.Authorization = `Bearer ${token}`;
      console.log(`%c[요청승인]`, "color:green; font-weight:bold;", config.method?.toUpperCase(), config.url);
      return config; // 쿠키에 token이 존재할 때, config 내에 반영시켜 비동기 요청 전송
    },
    error => {
      console.error("[요청에러]", error);
      return Promise.reject(error); //오류를 그대로 던져서 catch문으로 넘김
    }
  );

  myofficeAPI.interceptors.response.use(
    response => {
      console.log(`%c[응답성공]`, "color: dodgerblue; font-weight: bold;", response.config?.url);
      return response.data;
    },
    error => {
      console.error("[응답에러]", error?.response || error);
      return Promise.reject(error);
    }
  )

  return (
    <AxiosContext.Provider value={myofficeAPI}>
      {children}
    </AxiosContext.Provider>
  );
};

