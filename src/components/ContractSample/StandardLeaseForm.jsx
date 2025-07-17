import React from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import ComponentCard from "../common/ComponentCard";
import HousingContractForm from "./StandardLeaseForm/HousingContractForm";
import ContractTermsSection from "./StandardLeaseForm/ContractTermsSection";
import ContractLawSection from "./StandardLeaseForm/ContractLawSection";
import ContractSpecialTerms from "./StandardLeaseForm/ContractSpecialTerms";
import ContractSignSection from "./StandardLeaseForm/ContractSignSection";

export default function StandardLeaseForm({
  handleChange,
  onNext,
  onBack,
  contractInfo,
  setContractInfo,
}) {
  return (
    <ComponentCard
      title="🏠 주택임대차표준계약서"
      desc="실제 계약서를 기준으로 작성된 UI입니다."
      onBack={onBack}
    >
      <HousingContractForm
        contractInfo={contractInfo}
        handleChange={handleChange}
      />
      <ContractTermsSection
        contractInfo={contractInfo}
        handleChange={handleChange}
      />
      <ContractLawSection
        contractInfo={contractInfo}
        handleChange={handleChange}
      />
      <ContractSpecialTerms
        contractInfo={contractInfo}
        handleChange={handleChange}
      />
      <ContractSignSection
        contractInfo={contractInfo}
        handleChange={handleChange}
      />
      <div className="mt-6 flex justify-end">
        <Button
          onClick={onNext}
          className="bg-amber-500 text-white hover:bg-amber-600"
        >
          다음 →
        </Button>
      </div>
    </ComponentCard>
  );
}
