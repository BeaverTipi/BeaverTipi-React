import ContractPDFRenderer from "./ContractPDFRenderer";

export default function ContractPreview({ file, onConfirm, onBack }) {
  if (!file) {
    return (
      <div className="text-center text-gray-500 p-6">
        PDF 미리보기를 생성할 수 없습니다. 파일이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-lg font-bold">📄 계약서 미리보기</h2>

      <ContractPDFRenderer file={file} />

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onBack}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          ← 수정
        </button>
        <button
          onClick={onConfirm}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          계약 조건 입력하기 →
        </button>
      </div>
    </div>
  );
}
