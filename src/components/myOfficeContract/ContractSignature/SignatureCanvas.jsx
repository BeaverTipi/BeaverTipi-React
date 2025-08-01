import React, { useRef, useState, useEffect } from "react";
import { ROLE } from "../../../js/reducerContractSignature";

function SignatureCanvas({ signers, onSigned, onReject, myRole }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCanvasVisible, setIsCanvasVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const signerInfo =
    myRole === ROLE.LESSOR
      ? signers.LESSOR
      : myRole === ROLE.LESSEE
        ? signers.LESSEE
        : signers.AGENT;

  // 🖌️ 캔버스 초기화 (캔버스가 보일 때만)
  useEffect(() => {
    if (!isCanvasVisible || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctxRef.current = ctx;
  }, [isCanvasVisible]);

  // 좌표 계산
  const getCanvasCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches?.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // 드로잉 시작
  const startDrawing = (e) => {
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  // 드로잉 중
  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // 드로잉 종료
  const stopDrawing = (e) => {
    e.preventDefault();
    if (!ctxRef.current) return;
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  // 서명 초기화
  const clearCanvas = () => {
    if (!ctxRef.current || !canvasRef.current) return;
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // 서명 완료
  const handleSign = () => {
    if (!signerInfo) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onSigned({ dataUrl, signerInfo });
  };

  // 서명 거절
  const handleReject = () => {
    if (typeof onReject === "function") {
      onReject();
    }
  };

  // 서명 작성 버튼 클릭 시 캔버스 로딩 후 표시
  const handleStartSign = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsCanvasVisible(true);
      setIsLoading(false);
    }, 500); // 0.5초 로딩 후 캔버스 표시
  };

  if (!signerInfo || !signerInfo.role || !signerInfo.name) {
    return <div className="text-gray-400 italic text-sm">현재 서명할 수 있는 사용자가 아닙니다.</div>;
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <p className="text-sm text-gray-300">
        {signerInfo?.name}님 ({signerInfo?.role}) - {signerInfo?.telno}
      </p>

      {isLoading && <p className="text-gray-400 text-sm italic">서명 영역 준비 중...</p>}

      {isCanvasVisible && (
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="bg-white border border-gray-300 rounded"
          style={{ touchAction: "none" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      )}

      <div className="flex gap-3">
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          onClick={clearCanvas}
        >
          초기화
        </button>

        {!isCanvasVisible ? (
          <button
            className="px-4 py-2 bg-sky-700 text-white rounded hover:bg-sky-600"
            onClick={handleStartSign}
            disabled={isLoading}
          >
            서명 작성
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-sky-700 text-white rounded hover:bg-sky-600"
            onClick={handleSign}
          >
            서명 완료
          </button>
        )}

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
