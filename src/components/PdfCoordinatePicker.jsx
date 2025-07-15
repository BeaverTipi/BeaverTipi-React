import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import "../worker/pdfjsWorkerWrapper"; // workerSrc 설정됨

export default function PdfCoordinatePicker({ pdfFile }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });

  const [coordinates, setCoordinates] = useState([]);

  useEffect(() => {
    const loadPDF = async () => {
      const response = await fetch(pdfFile);
      const pdfData = new Uint8Array(await response.arrayBuffer());

      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const page = await pdf.getPage(1); // 첫 페이지만 대상
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setPageSize({ width: viewport.width, height: viewport.height });

      await page.render({ canvasContext: context, viewport }).promise;
    };

    loadPDF();
  }, [pdfFile]);

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(rect.height - (e.clientY - rect.top)); // PDF-lib 기준 좌표계 변환

    const newCoord = { page: 0, key: "", x, y };
    setCoordinates((prev) => [...prev, newCoord]);
    console.log("📌 좌표:", newCoord);
  };

  const copyToClipboard = () => {
    const text = JSON.stringify(coordinates, null, 2);
    navigator.clipboard.writeText(text);
    alert("좌표 JSON이 복사되었습니다!");
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">📐 PDF 좌표 추출기</h2>
      <div
        ref={containerRef}
        className="border p-2 inline-block"
        onClick={handleClick}
      >
        <canvas ref={canvasRef} className="cursor-crosshair" />
      </div>
      <div>
        <button onClick={copyToClipboard} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          JSON 복사
        </button>
      </div>
      <pre className="bg-gray-100 text-sm p-4 mt-4 rounded max-h-[300px] overflow-auto">
        {JSON.stringify(coordinates, null, 2)}
      </pre>
    </div>
  );
}
