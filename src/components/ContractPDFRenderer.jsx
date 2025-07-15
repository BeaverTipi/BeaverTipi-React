import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import "../worker/pdfjsWorkerWrapper"; // workerSrc 설정됨



export default function ContractPDFRenderer({ file }) {
  const containerRef = useRef(null);
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    if (!file) return;

    const renderPDF = async () => {
      let pdfData;

      if (file instanceof File) {
        const reader = new FileReader();
        pdfData = await new Promise((resolve) => {
          reader.onload = () => resolve(new Uint8Array(reader.result));
          reader.readAsArrayBuffer(file);
        });
      } else if (typeof file === "string") {
        const response = await fetch(file);
        const buffer = await response.arrayBuffer();
        pdfData = new Uint8Array(buffer);
      } else {
        console.error("지원하지 않는 file 타입:", file);
        return;
      }

      const pdf = await pdfjsLib.getDocument(pdfData).promise;
      setNumPages(pdf.numPages);

      const container = containerRef.current;
      container.innerHTML = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.0 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        canvas.className = "mb-6 border shadow max-w-[800px]";
        container.appendChild(canvas);
      }
    };

    renderPDF();
  }, [file]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center max-h-[800px] overflow-y-auto p-4 bg-white rounded-md border"
    />
  );
}
