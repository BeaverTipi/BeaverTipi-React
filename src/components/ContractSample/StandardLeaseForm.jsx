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
  formData,
  onChange,
  onNext,
  onBack,
  handleChangeLessorField,
}) {
  return (
    <ComponentCard
      title="🏠 주택임대차표준계약서"
      desc="실제 계약서를 기준으로 작성된 UI입니다."
      onBack={onBack}
    >
      <HousingContractForm
        formData={formData}
        onChange={onChange}
        handleChangeLessorField={handleChangeLessorField}
      />
      <ContractTermsSection
        formData={formData}
        onChange={onChange}
        handleChangeLessorField={handleChangeLessorField}
      />
      <ContractLawSection formData={formData} onChange={onChange} />
      <ContractSpecialTerms formData={formData} onChange={onChange} />
      <ContractSignSection formData={formData} onChange={onChange} />
      <div className="mt-6 flex justify-end">
        <Button
          onClick={onNext}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          계약서 저장
        </Button>
      </div>
    </ComponentCard>
  );
}
