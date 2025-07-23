import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Swal from "sweetalert2";
import { useSecureAxios } from "../hooks/useSecureAxios";
import { useAxios } from "../hooks/useAxios";

export default function ContractSignature() {
  const brokerAxios = useAxios();
  const navigate = useNavigate();
  const location = useLocation();
  const contId = location.state?.contId;
  const [loading, setLoading] = useState(true);
  const currentContId = useRef(
    contId || localStorage.getItem("ACTIVE_SIGN_CONTID") || ""
  ).current;

  useEffect(() => {
    // JWT 인증 여부 확인
    brokerAxios
      .get("http://localhost:80/rest/auth", { withCredentials: true })
      .then(() => console.log("✅ 인증됨"))
      .catch(() => navigate("/signin", { replace: true }));

    const timer = setTimeout(() => setLoading(false), 2200); // 3초 후 로딩 false
    return () => clearTimeout(timer); // cleanup
  }, []);
  useEffect(() => {
    if (contId) localStorage.setItem("ACTIVE_SIGN_CONTID", contId);
  }, [contId]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:80/ws/contractExpire");

    socket.onopen = () => {
      console.log("✅ [SIGNPAGE] WebSocket 연결 성공");
    };

    socket.onmessage = (event) => {
      const msg = event.data;
      if (msg.startsWith("EXPIRED:")) {
        const expiredContId = msg.split(":")[1];
        console.log("⛔ 만료 감지 →", expiredContId);

        if (expiredContId === currentContId) {
          Swal.fire({
            icon: "info",
            title: "서명 만료",
            text: "전자서명의 유효 시간이 만료되었습니다.",
          }).then(() => {
            if (window.history.length > 1) navigate(-1);
            else navigate("/"); //window.close();
          });
        }
      }
    };

    socket.onerror = (err) => {
      console.error("❌ [SIGNPAGE] WebSocket 에러", err);
    };

    socket.onclose = () => {
      console.log("🔌 [SIGNPAGE] WebSocket 연결 종료");
    };

    return () => {
      socket.close();
    };
  }, [currentContId]); // 현재 계약 ID를 상태로 두고 비교

  if (!currentContId) {
    return <div>접근이 유효하지 않습니다.</div>; // 직접 접근 차단
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <svg
          className="animate-spin h-10 w-10 text-white mb-4"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="white"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="white"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
          />
        </svg>
        <p className="text-lg">계약 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white p-6 space-y-6">
      <h1 className="text-2xl font-semibold">전자계약 서명 {contId}</h1>

      {/* 계약 주요정보 요약 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* 좌측: PDF 미리보기 */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md overflow-auto max-h-[75vh]">
          <h2 className="text-lg font-semibold mb-4">계약서 미리보기</h2>
          {/* <PDFViewer /> */}
        </div>

        {/* 우측: 서명판 + 상태표시 */}
        <div className="flex flex-col gap-6">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">서명 상태</h2>
            {/* <SignatureStatusBoard /> */}
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">서명하기</h2>
            {/* <SignatureCanvas /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
