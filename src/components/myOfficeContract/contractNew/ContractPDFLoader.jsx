import React, { useEffect, useRef } from "react";
import "../../../worker/pdfjsWorkerWrapper"; // workerSrc 설정됨
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import axios from "axios";
import ComponentCard from "../../common/ComponentCard";

const ContractPDFLoader = ({ listing, uploadedFiles, onCrtfExtracted }) => {
  const containerRefs = useRef([]);

  useEffect(() => {
    uploadedFiles.forEach((file, fileIdx) => {
      if (file.type === "application/pdf") {
        const reader = new FileReader();

        reader.onload = async function () {
          try {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;

            const container = containerRefs.current[fileIdx];
            container.innerHTML = ""; // 초기화

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
              const page = await pdf.getPage(pageNum);
              const viewport = page.getViewport({ scale: 1.3 });

              const canvas = document.createElement("canvas");
              const context = canvas.getContext("2d");
              canvas.width = viewport.width;
              canvas.height = viewport.height;

              await page.render({ canvasContext: context, viewport }).promise;

              canvas.className = "mb-6 border rounded shadow";
              container.appendChild(canvas);
            }

            // OCR (첫 번째 PDF만)
            if (fileIdx === 0 && onCrtfExtracted) {
              const formData = new FormData();
              formData.append("file", file);

              axios
                .post("/ajax/pdf/extract-crtfno", formData)
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
          } catch (err) {
            console.error("PDF 렌더링 중 오류 발생:", err);
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
              <div
                ref={(el) => (containerRefs.current[idx] = el)}
                className="flex flex-col gap-4 items-center"
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
