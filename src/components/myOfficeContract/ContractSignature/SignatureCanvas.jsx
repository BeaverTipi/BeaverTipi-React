import React, { useRef, useEffect, useState } from "react";
import SHA256 from "crypto-js/sha256";
import Base64 from "crypto-js/enc-base64";
import { useAES256 } from "../../../hooks/useAES256"
import { useSignatureHash } from "../../../hooks/useSignatureHash";

function SignatureCanvas({ signerInfo, onSignatureComplete, onSign, onSignComplete }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);
  const createHash = useSignatureHash();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.strokeStyle = "#000000";
    context.lineWidth = 2;
    context.lineCap = "round";
    setCtx(context);
  }, []);


  const startDrawing = (e) => {
    ctx.beginPath();
    ctx.moveTo(
      e.nativeEvent.offsetX || e.touches?.[0]?.clientX,
      e.nativeEvent.offsetY || e.touches?.[0]?.clientY
    );
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const x = e.nativeEvent.offsetX || e.touches?.[0]?.clientX;
    const y = e.nativeEvent.offsetY || e.touches?.[0]?.clientY;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };



  const handleComplete = () => {
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const now = new Date().toISOString();

    // ✅ 서명 해시 생성
    const hashVal = createHash({
      base64Image: dataUrl,
      mbrId: signerInfo.mbrId,
      contId: signerInfo.contId,
      role: signerInfo.role,
      signedAt: signerInfo.signedAt,
    });

    // ✅ 서명자 정보에 signedAt 추가
    const signedInfo = {
      ...signerInfo
      , signedAt: now
      , hashVal: hashVal
    };
    // ✅ onSignatureComplete 콜백에 전체 정보 전달
    if (onSignatureComplete)
      onSignatureComplete({ dataUrl, signerInfo: signedInfo, });

    if (typeof onSignComplete === "function") {
      onSignComplete(); // → 부모에서 PDF 갱신 트리거
    }


    // ✅ 실시간 WebSocket 알림
    if (onSign && signerInfo?.role) onSign(signerInfo.role);
    // ✅ 디버깅용 콘솔 출력
    console.log(
      `%c[서명자] ${signedInfo.name} (${signedInfo.role}) 서명 완료 at ${signedInfo.signedAt}`,
      "color:magenta;font-weight:bold"
    );
  };



  return (
    <div className="flex flex-col items-center space-y-4">
      <p className="text-sm text-gray-300">
        {signerInfo?.name}님 ({signerInfo?.role}) - {signerInfo?.telno}
      </p>
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
      </div>
    </div>
  );
}

export default SignatureCanvas;
