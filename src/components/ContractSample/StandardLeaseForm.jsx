import React, { useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import ComponentCard from "../common/ComponentCard";
import HousingContractForm from "./StandardLeaseForm/HousingContractForm";
import ContractTermsSection from "./StandardLeaseForm/ContractTermsSection";
import ContractLawSection from "./StandardLeaseForm/ContractLawSection";
import ContractSpecialTerms from "./StandardLeaseForm/ContractSpecialTerms";
import ContractSignSection from "./StandardLeaseForm/ContractSignSection";

export default function StandardLeaseForm({ formData, onChange, onSubmit, onBack }) {
  return (
    <ComponentCard
      title="🏠 주택임대차표준계약서"
      desc="실제 계약서를 기준으로 작성된 UI입니다."
      onBack={onBack}
    >
      <HousingContractForm />
      <ContractTermsSection />
      <ContractLawSection />
      <ContractSpecialTerms />
      <ContractSignSection />
    </ComponentCard>
  );
}
