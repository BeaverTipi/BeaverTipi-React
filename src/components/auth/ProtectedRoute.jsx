// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = ({ children }) => {
  const authToken = Cookies.get("access_token"); // 쿠키에서 인증 토큰 확인

  if (!authToken) {
    const currentUrl = encodeURIComponent(window.location.href);
     window.location.href = `http://localhost/?redirect=${currentUrl}`;
    return null;
  }

  return children;
};

export default ProtectedRoute;
