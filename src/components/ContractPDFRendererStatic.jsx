import React, { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

import pdfBase64 from "../context/standardLeaseBase64.json";

export default function ContractPDFRendererStatic() {
  const containerRef = useRef(null);
  const { base64String } = pdfBase64;

  useEffect(() => {
    const renderPDF = async () => {
      const binary = atob(base64String);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const pdf = await pdfjsLib.getDocument(bytes).promise;
      const container = containerRef.current;
      container.innerHTML = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.25 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.className =
          "mb-6 border shadow block max-w-full w-full h-auto mx-auto";

        await page.render({ canvasContext: context, viewport }).promise;

        // ✅ 캔버스에 적절한 max-width, 중앙 정렬
        canvas.className = "mb-6 border shadow w-full max-w-[720px] mx-auto block";
        container.appendChild(canvas);
      }
    };

    renderPDF();
  }, []);

  return (
    <div
      ref={containerRef}
      className="max-h-[75vh] overflow-y-auto p-4 bg-white rounded-md border"
    // ❌ 이벤트 막지 않기: 모달 닫힘 정상 작동하도록
    />
  );
}