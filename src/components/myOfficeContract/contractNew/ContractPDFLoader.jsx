import React, { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import axios from "axios";
import ComponentCard from "../../common/ComponentCard";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ContractPDFLoader = ({ listing, uploadedFiles, onCrtfExtracted }) => {
  const canvasRefs = useRef([]);

  useEffect(() => {
    uploadedFiles.forEach((file, idx) => {
      if (file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = async function () {
          const typedarray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          const page = await pdf.getPage(1);

          const viewport = page.getViewport({ scale: 1.3 });
          const canvas = canvasRefs.current[idx];
          const context = canvas.getContext("2d");

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;

          // 🔍 첫 번째 PDF에 대해 OCR 수행
          if (idx === 0 && onCrtfExtracted) {
            const formData = new FormData();
            formData.append("file", file);

            axios
              .post("/ajax/pdf/extract-crtfno", formData, {
                headers: { "Content-Type": "multipart/form-data" },
              })
              .then((resp) => {
                if (resp.data.success) {
                  onCrtfExtracted(resp.data.crtfNo);
                } else {
                  console.warn("자격증 번호를 찾지 못했습니다.");
                }
              })
              .catch((err) => {
                console.error("자격증 추출 실패", err);
              });
          }
        };
        reader.readAsArrayBuffer(file);
      }
    });
  }, [uploadedFiles, onCrtfExtracted]);

  return (

    <div className="col-span-2 max-h-[800px] overflow-y-auto pr-2">


      {uploadedFiles.length === 0 ? (
        <p className="text-gray-400 text-center">첨부된 파일이 없습니다.</p>
      ) : (
        uploadedFiles.map((file, idx) => (
          <div key={idx} className="border p-4 rounded bg-white dark:bg-gray-800 shadow-sm">
            <h4 className="text-sm font-semibold mb-2">{file.name}</h4>

            {file.type === "application/pdf" ? (
              <canvas
                ref={(el) => (canvasRefs.current[idx] = el)}
                className="w-full border rounded"
              />
            ) : file.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full max-h-[700px] object-contain border rounded"
              />
            ) : (
              <p className="text-gray-400 text-sm">미리보기를 지원하지 않는 형식입니다.</p>
            )}
          </div>
        ))
      )}
    </div>

  );
};

export default ContractPDFLoader;
