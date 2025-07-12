// ContractSampleSelect.jsx
import { motion } from "framer-motion";
import { useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import ContractPDFRendererStatic from "../ContractPDFRendererStatic";

const contractSamples = [
  {
    id: "STANDARD_RENT_001",
    title: "📄 표준 임대차계약서",
    desc: "국토교통부 제공 표준 양식의 계약서입니다.",
  },
  {
    id: "STANDARD_SALE_001",
    title: "📄 부동산 매매계약서",
    desc: "국토교통부 제공 표준 양식의 계약서입니다.",
  },
];

export default function ContractSampleSelect({ onNext, onBack, contractInfo }) {
  console.log("데이터 추가 확인-->", contractInfo);

  const [selectedSample, setSelectedSample] = useState(null);
  const [previewSample, setPreviewSample] = useState(null); // 모달용
  const handleProceed = () => {
    if (selectedSample) {
      onNext(selectedSample.id);
    }
  };
  console.log("contractSamples", contractSamples);

  const handleRightClick = (e, sample) => {
    e.preventDefault();
    setPreviewSample(sample);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <ComponentCard
        title="📑 계약서 양식 선택"
        desc="사용할 계약서 양식을 선택해주세요."
        onBack={onBack}
      >
        <div className="mb-6 p-4 rounded border bg-gray-50">
          <Label>사용 가능한 계약서 목록</Label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contractSamples.map(sample => (
              <div
                key={sample.id}
                onClick={() => setSelectedSample(sample)}
                onContextMenu={(e) => handleRightClick(e, sample)}

                className={`p-4 rounded-xl border cursor-pointer shadow-sm bg-white hover:bg-gray-50 ${selectedSample?.id === sample.id
                  ? "border-amber-500 bg-blue-50"
                  : "border-gray-200"
                  }`}
              >
                <h3 className="font-bold text-gray-800">{sample.title}</h3>
                <p className="text-sm text-gray-500">{sample.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-6 gap-3">
          <Button color="gray" onClick={onBack}>
            ← 이전
          </Button>
          <Button
            className="bg-amber-600 text-white hover:bg-amber-800"
            onClick={handleProceed}
            disabled={!selectedSample}
          >
            선택 완료 →
          </Button>
        </div>

      </ComponentCard>
      {/* 모달 */}
      <Modal isOpen={!!previewSample} onClose={() => setPreviewSample(null)} showCloseButton>
        <div className="p-6 w-[720px] max-w-full max-h-[85vh] overflow-y-auto m-auto">
          <h2 className="text-xl font-bold mb-4">{previewSample?.title} 미리보기</h2>
          {previewSample?.id === "STANDARD_RENT_001" ? (
            <ContractPDFRendererStatic />
          ) : (
            <p className="text-sm text-gray-600">PDF 미리보기를 준비 중입니다.</p>
          )}
        </div>
      </Modal>
    </motion.div >
  );
}
