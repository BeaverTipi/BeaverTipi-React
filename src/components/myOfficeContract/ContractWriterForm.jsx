import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import StandardLeaseForm from "../ContractSample/StandardLeaseForm";

const FORM_SAMPLE_MAP = {
  STANDARD_LEASE_001: {
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
    contractType: "",
    land: "",
    structure: "",
    area: "",
    rentedArea: "",
    contractDeposit: "",
    middlePayment: "",
    balancePayment: "",
    management1: "",
    management2: "",
    management3: "",
    management4: "",
    management5: "",
    management6: "",
    management7: "",
    management8: "",
    startDate: "",
    endDate: "",
    repairNeed: "",
    repairDeadline: "",
    repairCostCoveredBy: "",
    landlordBurden: "",
    tenantBurden: "",
    agreedTerms: false,
    moveInDeadline: "",
    agreeMediation: false,
    assetPlan: "",
    detailedAddrFee: "",
    contractYear: "",
    contractMonth: "",
    contractDay: "",
    lessorAddress: "",
    lessorRegNum: "",
    lessorSign: null,
    lesseeAddress: "",
    lesseeRegNum: "",
    lesseeSign: null,
    agentOffice: "",
    agentOfficeAddr: "",
    agentRegNum: "",
    agentRep: "",
    agentPhone: "",
    agentSign: null
  },
  SALE_CONTRACT_002: {
    // 추후 매매 계약 양식 정의 시 여기에 기본값 추가 예정
  }
};

export default function ContractWriterForm({ sampleId, onSave, onBack }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (FORM_SAMPLE_MAP[sampleId]) {
      setFormData(FORM_SAMPLE_MAP[sampleId]);
    } else {
      setFormData({});
    }
  }, [sampleId]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {renderFormBySampleId()}
    </motion.div>
  );
}
