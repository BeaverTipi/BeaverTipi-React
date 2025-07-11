import { motion } from "framer-motion";
import { useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import StandardLeaseForm from "../ContractSample/StandardLeaseForm";

export default function ContractWriterForm({ sampleId, onSave, onBack }) {
  const [formData, setFormData] = useState({
    contractName: "",
    duration: "",
    amount: "",
    location: "",
    landPurpose: "",
    buildingType: "",
    leasePart: "",
    deposit: "",
    monthlyRent: "",
    contractPeriod: "",
    confirmedDate: "",
    specialTerms: "",
    lessorName: "",
    lessorPhone: "",
    lessorAddr: "",
    lesseeName: "",
    lesseePhone: "",
    lesseeAddr: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    onSave(formData);
  };
  const renderFormBySampleId = () => {
    switch (sampleId) {
      case "STANDARD_RENT_001":
        return (
          <StandardLeaseForm
            formData={formData}
            onChange={handleChange}
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
