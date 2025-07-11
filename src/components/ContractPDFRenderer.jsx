import React, { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry"; // Webpack/Vite 환경에서 필수

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function ContractPDFRenderer({ file }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!file) return;

    const renderPDF = async () => {
      const reader = new FileReader();

      reader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        const page = await pdf.getPage(1); // 첫 페이지만 예제로 렌더링

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const viewport = page.getViewport({ scale: 1.5 });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
      };

      reader.readAsArrayBuffer(file);
    };

    renderPDF();
  }, [file]);

  return (
    <div className="border rounded-lg overflow-hidden p-4">
      <canvas ref={canvasRef} className="w-full max-w-4xl mx-auto border" />
    </div>
  );
}
