import { useContext } from "react";
import { AESContext } from "../context/AESContext";

export const useAES256 = () => {
  const context = useContext(AESContext);
  if (!context) {
    throw new Error("useAES는 AESProvider 내부에서 사용되어야 합니다.");
  }
  return context;
};