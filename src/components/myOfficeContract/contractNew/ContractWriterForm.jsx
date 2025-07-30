import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ComponentCard from "../../common/ComponentCard";
import StandardLeaseForm from "../../ContractSample/StandardLeaseForm";
import { useContractInfo } from "../../../context/ContractInfoContext";

export default function ContractWriterForm({
  onSave,
  onBack,
}) {
  const { contractInfo, setContractInfo } = useContractInfo();

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    let newValue;

    switch (type) {
      case "checkbox":
        newValue = checked;
        break;
      case "file":
        newValue = files[0]; // 또는 URL.createObjectURL(files[0]) if preview needed
        break;
      default:
        newValue = value;
    }

    setContractInfo((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSave = () => {
    onSave(contractInfo);
  };

  const renderFormBySampleId = () => {
    switch (contractInfo.contractSampleId) {
      case "STANDARD_RENT_001":
        return (
          <StandardLeaseForm
            contractInfo={contractInfo}
            setContractInfo={setContractInfo}
            handleChange={handleChange}
            onNext={handleSave}
            onBack={onBack}
          />
        );
      case "SALE_CONTRACT_002":
        return <div>🛠 매매 계약서 UI는 준비 중입니다</div>;
      default:
        return (
          <ComponentCard
            title="❌ 계약서 유형 오류"
            desc="선택한 계약서 양식이 존재하지 않습니다."
            onBack={onBack}
          />
        );
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {renderFormBySampleId()}
      </motion.div>
    </>
  );
}
