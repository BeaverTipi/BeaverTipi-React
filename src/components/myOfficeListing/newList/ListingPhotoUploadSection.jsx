import React, { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import { useDropzone } from "react-dropzone";

export default function ListingPhotoUploadSection({
  onChange,
  isEditMode = false,
  existingImages = [],
}) {
  const [previewFiles, setPreviewFiles] = useState([]);

  const onDrop = (acceptedFiles) => {
    const newPreviews = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    const updatedFiles = [...previewFiles, ...newPreviews];
    setPreviewFiles(updatedFiles);
    onChange?.(updatedFiles.map((p) => p.file));
  };

  const removeFile = (indexToRemove) => {
    const updatedFiles = previewFiles.filter((_, idx) => idx !== indexToRemove);
    setPreviewFiles(updatedFiles);
    onChange?.(updatedFiles.map((p) => p.file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
  });

  useEffect(() => {
    return () => {
      previewFiles.forEach((fileObj) => URL.revokeObjectURL(fileObj.preview));
    };
  }, [previewFiles]);

  return (
    <ComponentCard title="사진 등록">
      <div className="transition border border-gray-300 border-dashed rounded-xl p-6 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
        {/* ✅ 기존 이미지 미리보기 */}
        {isEditMode && existingImages.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">기존 이미지</h4>
            <div className="flex gap-4 flex-wrap">
              {existingImages.map((url, idx) => (
                <div key={idx} className="w-32 h-32 rounded overflow-hidden border shadow">
                  <img
                    src={url}
                    alt={`기존 이미지 ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <form
          {...getRootProps()}
          className={`cursor-pointer ${
            isDragActive ? "bg-amber-100 dark:bg-gray-800" : ""
          }`}
          id="demo-upload"
        >
          <input {...getInputProps()} />
          <div className="dz-message flex flex-col md:flex-row gap-6">
            {/* 왼쪽: 파일 리스트 */}
            <div className="w-full md:w-1/2">
              <h5 className="font-semibold mb-3 text-gray-700 dark:text-white">
                업로드된 파일 목록
              </h5>
              {previewFiles.length > 0 ? (
                <ul className="space-y-2 text-sm text-gray-800 dark:text-gray-300">
                  {previewFiles.map((fileObj, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center border p-2 rounded bg-white dark:bg-gray-800 shadow-sm truncate"
                    >
                      <span className="truncate">
                        {fileObj.file.name} ({(fileObj.file.size / 1024).toFixed(1)} KB)
                      </span>
                      <button
                        type="button"
                        className="text-red-500 text-xs ml-2"
                        onClick={() => removeFile(idx)}
                      >
                        제거
                      </button>
                    </li>
                  ))}
                  <li className="text-xs text-gray-500 dark:text-gray-400 italic mt-2">
                    파일을 추가로 업로드하려면 여기를 다시 클릭하거나 드래그하세요
                  </li>
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  아직 업로드된 파일이 없습니다. 파일을 클릭하거나 드래그하여 추가하세요.
                </p>
              )}
            </div>

            {/* 오른쪽: 이미지 미리보기 */}
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
              {previewFiles.length > 0 ? (
                previewFiles.map((fileObj, idx) => (
                  <div key={idx} className="relative group rounded overflow-hidden shadow">
                    <img
                      src={fileObj.preview}
                      alt={`preview-${idx}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-gray-500 dark:text-gray-400">
                  이미지 미리보기 없음
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </ComponentCard>
  );
}
