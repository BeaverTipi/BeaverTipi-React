import { useContext } from "react";
import { DomainContext } from "../context/DomainContext";

export const useDomain = () => {
  const context = useContext(DomainContext);
  if (!context) throw new Error("^ㅂ^ㅗ useDomain()훅은 항상 DoaminProvider 내부에서 실행되어야 합니다.");
  return context;
};