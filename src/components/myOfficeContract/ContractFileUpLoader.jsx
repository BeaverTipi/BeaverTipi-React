import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import ComponentCard from "../common/ComponentCard";

const ContractFileUpLoader = ({ selectedListing, uploadedFiles, setUploadedFiles }) => {

  const onDrop = acceptedFiles => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
  };
  const handleRemoveFile = idx => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
    },
  });

  return (
    <>

  <div className="cursor-pointer relative min-h-[300px] rounded-xl border border-dashed border-gray-300 dark:border-gray-700 overflow-hidden">
    {/* 드래그 input만 전면에 배치 */}
    <div {...getRootProps()} className="absolute inset-0 z-10">
      <input {...getInputProps()} className="w-full h-full opacity-0 cursor-pointer" />
    </div>

    {/* 드롭 문구 - 파일 없을 때만 노출 */}
    {uploadedFiles.length === 0 && (
      <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
          📁
        </div>
        <h4 className="mt-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
          {isDragActive ? "Drop Files Here" : "Drag & Drop Files Here"}
        </h4>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          PNG, JPG, PDF, DOCX 등 가능
        </span>
      </div>
    )}

    {/* 파일 리스트 */}
    <div className="relative z-20 p-5 space-y-2 overflow-y-auto max-h-[250px]">
      {uploadedFiles.length === 0 ? (
        <p className="text-center text-sm text-gray-400 dark:text-gray-600">
          아직 첨부된 파일이 없습니다.
        </p>
      ) : (
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
          {uploadedFiles.map((file, idx) => (
            <li
              key={idx}
              className="relative bg-gray-50 dark:bg-gray-800 border rounded px-4 py-2 pr-10"
            >
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
              <button
                onClick={() => handleRemoveFile(idx)}
                className="absolute top-1 right-1 text-gray-400 hover:text-red-600 z-[50]"
                title="삭제"
              >
                ✖
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
</>
  );
};

export default ContractFileUpLoader;
