import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  const PROTOCOL = window.location.protocol; // 'http:' or 'https:'
  let HOSTNAME = window.location.hostname;   // e.g., react.beavertipi.com

  // 👉 react 서브도메인 접근 시 백엔드는 beavertipi.com 사용
  if (HOSTNAME === "react.beavertipi.com") {
    HOSTNAME = "beavertipi.com";
  }
  if (HOSTNAME === "dev.beavertipi.com") {
    HOSTNAME = "dev1.beavertipi.com";
  }

      if (HOSTNAME === "hbdev1.beavertipi.com") {

    HOSTNAME = "hbdev.beavertipi.com";
  }

  const baseURL = `${PROTOCOL}//${HOSTNAME}`; // ❌ :80 제거

  useEffect(() => {
    axios
      .get(`${baseURL}/rest/auth`, { withCredentials: true })
      .then(() => {
        setAuthenticated(true);
      })
      .catch(() => {
        axios
          .post(`${baseURL}/account/logout`, {}, { withCredentials: true })
          .finally(() => {
            const currentUrl = encodeURIComponent(window.location.href);
            window.location.href = `${baseURL}/?redirect=${currentUrl}`;
          });
      })
      .finally(() => setChecking(false));
  }, [location.pathname, location.search]);

  if (checking) return null;
  return authenticated ? children : null;
};

export default ProtectedRoute;
