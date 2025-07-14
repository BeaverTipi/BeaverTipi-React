import ComponentCard from "../common/ComponentCard";
import ContractPDFRenderer from "../ContractPDFRenderer";
import Button from "../ui/button/Button";

export default function ContractPreview({ file, onConfirm, onBack }) {
  if (!file) {
    return (
      <>
        <ComponentCard
          title="📄 계약서류 프리뷰"
          onBack={onBack}>
          <div className="text-center text-gray-500 p-6">
            PDF 미리보기를 생성할 수 없습니다. 파일이 없습니다.
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={onConfirm}>
              다음 →
            </Button>
          </div>
        </ComponentCard >
      </>
    );
  }

  return (
    <ComponentCard
      onBack={onBack}>
      <div className="space-y-6 p-6">
        <h2 className="text-lg font-bold">📄 계약서 미리보기</h2>
        <div>
          <ContractPDFRenderer file={file} />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button
            onClick={onConfirm}>
            다음 →
          </Button>
        </div>
      </div>
    </ComponentCard>
  );
}
