/*
🔄 useSignatureHash 제거	해시는 ContractSignature.jsx에서 관리함
🧼 props 정리	contId는 상위에서 따로 들고 있음, signerInfo만 유지
🧠 역할 분리	캔버스는 서명만, 로직 판단은 상위 컴포넌트로 분리
🧠 예방 처리	signerInfo null 방어 처리 추가
*/
import React, { useRef, useEffect, useState } from "react";

function SignatureCanvas({
  signerInfo,
  onSignatureComplete,
  onSign,
  onSignComplete,
  onReject,
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);

  // 🖍️ 캔버스 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.strokeStyle = "#000000";
    context.lineWidth = 2;
    context.lineCap = "round";
    setCtx(context);
  }, []);

  // 🖌️ 드로잉 시작
  const startDrawing = (e) => {
    ctx.beginPath();
    ctx.moveTo(
      e.nativeEvent.offsetX || e.touches?.[0]?.clientX,
      e.nativeEvent.offsetY || e.touches?.[0]?.clientY
    );
    setIsDrawing(true);
  };

  // 🖌️ 드로잉 중
  const draw = (e) => {
    if (!isDrawing) return;
    const x = e.nativeEvent.offsetX || e.touches?.[0]?.clientX;
    const y = e.nativeEvent.offsetY || e.touches?.[0]?.clientY;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // ✋ 드로잉 종료
  const stopDrawing = () => {
    ctx.closePath();
    setIsDrawing(false);
  };

  // 🧽 서명 초기화
  const clearCanvas = () => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // ✅ 서명 완료 처리
  const handleComplete = () => {
    if (!signerInfo) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const now = new Date().toISOString();

    const signedInfo = {
      ...signerInfo,
      signedAt: now, // 해시는 상위 컴포넌트에서 생성
    };

    // 1️⃣ 서명 이미지 & signedAt 전달
    if (onSignatureComplete)
      onSignatureComplete({ dataUrl, signerInfo: signedInfo });

    // 3️⃣ WebSocket 서명 전파
    if (onSign && signerInfo?.role) onSign(signerInfo.role);

    // ✅ 디버깅 로그
    console.log(
      `%c[서명자] ${signedInfo.name} (${signedInfo.role}) 서명 완료 at ${signedInfo.signedAt}`,
      "color:magenta;font-weight:bold"
    );
  };

  // ✅ 서명 거절 버튼 클릭 시
  const handleReject = () => {
    if (typeof onReject === "function") {
      onReject(); // → 상위에서 Swal.confirm + 전파
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* 👤 서명자 정보 */}
      <p className="text-sm text-gray-300">
        {signerInfo?.name}님 ({signerInfo?.role}) - {signerInfo?.telno}
      </p>

      {/* ✍️ 서명판 */}
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="bg-white border border-gray-300 rounded"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      ></canvas>

      {/* 🧭 액션 버튼 */}
      <div className="flex gap-3">
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          onClick={clearCanvas}
        >
          초기화
        </button>
        <button
          className="px-4 py-2 bg-sky-700 text-white rounded hover:bg-sky-600"
          onClick={handleComplete}
        >
          서명 완료
        </button>
        <button
          className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600"
          onClick={handleReject}
        >
          서명 거절
        </button>
      </div>
    </div>
  );
}

export default SignatureCanvas;
