import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function ContractPDFRenderer({ file }) {
  const containerRef = useRef(null);
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    if (!file) return;

    const renderPDF = async () => {
      const reader = new FileReader();

      reader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        setNumPages(pdf.numPages);

        // 기존 canvas 비우기
        const container = containerRef.current;
        container.innerHTML = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const renderContext = { canvasContext: context, viewport };
          await page.render(renderContext).promise;

          canvas.className = "mb-6 border shadow";
          container.appendChild(canvas);
        }
      };

      reader.readAsArrayBuffer(file);
    };

    renderPDF();
  }, [file]);

  return (
    <div
      ref={containerRef}
      className="max-h-[75vh] overflow-y-auto p-4 bg-white rounded-md border"
    />
  );
}
