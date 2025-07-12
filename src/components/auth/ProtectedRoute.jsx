import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();
  const BACKEND_PORT = 80;
  const PROTOCOL = window.location.protocol; // 'http:'
  const HOSTNAME = window.location.hostname; // 'localhost' 또는 '192.168.x.x'
  const baseURL = `${PROTOCOL}//${HOSTNAME}:${BACKEND_PORT}`;

  useEffect(() => {
    axios
      .get(`${baseURL}/rest/auth`, {
        withCredentials: true,
      })
      .then(() => {
        setAuthenticated(true);
      })
      .catch(() => {
        // ✅ 1. 먼저 서버에 logout 요청
        axios
          .post(`${baseURL}/account/logout`, {}, { withCredentials: true })
          .finally(() => {
            // ✅ 2. 그런 다음 redirect 수행
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