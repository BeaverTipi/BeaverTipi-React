import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    axios
      .get("http://localhost/rest/auth", {
        withCredentials: true,
      })
      .then(() => {
        setAuthenticated(true);
      })
      .catch(() => {
        // ✅ 1. 먼저 서버에 logout 요청
        axios
          .post("http://localhost/account/logout", {}, { withCredentials: true })
          .finally(() => {
            // ✅ 2. 그런 다음 redirect 수행
            const currentUrl = encodeURIComponent(window.location.href);
            window.location.href = `http://localhost/?redirect=${currentUrl}`;
          });
      })
      .finally(() => setChecking(false));
  }, [location.pathname, location.search]);

  if (checking) return null;
  return authenticated ? children : null;
};

export default ProtectedRoute;