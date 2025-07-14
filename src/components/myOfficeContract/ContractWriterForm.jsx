import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import StandardLeaseForm from "../ContractSample/StandardLeaseForm";

const FORM_SAMPLE_MAP = {
  STANDARD_RENT_001: {
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
    agentSign: null,
  },
  SALE_CONTRACT_002: {
    // 추후 매매 계약 양식 정의 시 여기에 기본값 추가 예정
  },
};

export default function ContractWriterForm({
  sampleId,
  onSave,
  onBack,
  contractInfo,
}) {
  console.log("contractInfo확인:", contractInfo);
  const [formData, setFormData] = useState({ lessor: {} });
  useEffect(() => {
    if (FORM_SAMPLE_MAP[sampleId]) {
      setFormData(FORM_SAMPLE_MAP[sampleId]);
      if (sampleId === "STANDARD_RENT_001") {
        console.log();
        setFormData((prev) => {
          return {
            contractName: "",
            duration: "",
            amount: "",
            location: "",
            locationBasic: contractInfo.listing?.lstgAdd || "",
            locationDetail: contractInfo.listing?.lstgAdd2 || "",
            landPurpose: "",
            buildingType: contractInfo.listing?.lstgTypeCode1 || "",
            leasePart: "",
            deposit: "",
            monthlyRent: "",
            contractPeriod: "",
            confirmedDate: "",
            specialTerms: "",
            lessor: { ...(contractInfo.tenancy || {}) },
            lessorName: contractInfo.tenancy?.mbrNm || "",
            lessorPhone: contractInfo.tenancy?.mbrTelNo || "",
            lessorAddr:
              contractInfo.tenancy?.mbrBasicAddr +
              contractInfo.tenancy?.mbrDetailAddr || "",
            lessorBankNm: contractInfo.tenancy?.lessorBankNm || "",
            lessorBankAcc: contractInfo.tenancy?.lessorBankAcc || "",
            lesseeName: contractInfo.lessee?.mbrNm || "",
            lesseePhone: contractInfo.lessee?.mbrTelno || "",
            lesseeAddr:
              contractInfo.lessee?.mbrBasicAddr +
              contractInfo.lessee?.mbrDetailAddr || "",
            contractType:
              contractInfo.listing?.lstgTypeSale === 1
                ? "전세"
                : contractInfo.listing?.lstgTypeSale === 2
                  ? "월세"
                  : contractInfo.listing?.lstgTypeSale === 3
                    ? "매매"
                    : "",
            land: "주거",

            structure:
              contractInfo.listing?.lstgTypeCode1 === 1
                ? "아파트"
                : contractInfo.listing?.lstgTypeCode1 === 2
                  ? "빌라"
                  : contractInfo.listing?.lstgTypeCode1 === 3
                    ? "오피스텔"
                    : contractInfo.listing?.lstgTypeCode1 === 4
                      ? "단독주택"
                      : contractInfo.listing?.lstgTypeCode1 === 5
                        ? "상가주택"
                        : contractInfo.listing?.lstgTypeCode1 === 6
                          ? "상가"
                          : contractInfo.listing?.lstgTypeCode1 === 7
                            ? "사무실"
                            : "",
            lstgExArea: contractInfo.listing?.lstgExArea || "",
            lstgGrArea: contractInfo.listing?.lstgGrArea || "",
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
            lessorRegNum: contractInfo.tenancy?.rentalPtyId || "",
            lessorSign: null,
            lesseeRegNum: "",
            lesseeSign: null,
            agentName: contractInfo.broker?.mbrNm || "",
            agentOffice: contractInfo.broker?.brokNm || "",
            agentOfficeAddr:
              contractInfo.broker?.brokAddr1 + contractInfo.broker?.brokAddr2 ||
              "",
            agentRegNum: contractInfo.broker?.borkRegNo || "",
            agentRep: "",
            agentPhone: contractInfo.broker?.mbrTelno || "",
            agentSign: null,
          };
        });
      }
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
            handleChangeLessorField={handleChangeLessorField}
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
  const handleChangeLessorField = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      lessor: {
        ...prev.lessor,
        [index]: {
          ...prev.lessor?.[index],
          [field]: value,
        },
      },
    }));
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
