import { useContext } from "react";
import { SecureAxiosContext } from "../context/SecureAxiosContext";

export const useSecureAxios = () => {
  const context = useContext(SecureAxiosContext);
  if (!context) throw new Error("useSecureAxios는 SecureAxiosProvider 내부에서 사용되어야 합니다.");
  return context;
};