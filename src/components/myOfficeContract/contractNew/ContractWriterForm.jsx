import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ComponentCard from "../../common/ComponentCard";
import StandardLeaseForm from "../../ContractSample/StandardLeaseForm";

export default function ContractWriterForm({
  sampleId,
  onSave,
  onBack,
  contractInfo,
  setContractInfo,
}) {
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
            deposit: contractInfo.listing?.lstgLeaseAmt || "",
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
            lstgLandArea: 663,
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
            year: "2025",
            month: "8",
            day: "5",
          };
        });
      }
    } else {
      setFormData({});
    }
  }, [sampleId]);

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
    onSave(formData);
  };

  const renderFormBySampleId = () => {
    switch (sampleId) {
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
