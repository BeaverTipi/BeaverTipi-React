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
import { getKSTDate } from "../../js/getKSTDate";

export default function StandardLeaseForm({
  handleChange,
  onNext,
  onBack,
  contractInfo,
  setContractInfo,
}) {
  const inputDummyData = () => {
    const today = getKSTDate();
    const startDate = getKSTDate(today);
    startDate.setDate(startDate.getDate() + 7);
    const endDate = getKSTDate(today);
    endDate.setFullYear(endDate.getFullYear() + 1);
    const twoWeeksLaterDate = getKSTDate(today);
    twoWeeksLaterDate.setDate(twoWeeksLaterDate.getDate() + 14);
    const repairDeadlineDate = getKSTDate(today);
    repairDeadlineDate.setDate(repairDeadlineDate.getDate() + 21);
    setContractInfo((prev) => ({
      ...prev,
      startDate: startDate.toISOString().split("T")[0], // input type="date" 형식
      startDateYear: String(startDate.getFullYear()),
      startDateMonth: String(startDate.getMonth() + 1).padStart(2, "0"),
      startDateDay: String(startDate.getDate()).padStart(2, "0"),
      endDate: endDate.toISOString().split("T")[0],
      endDateYear: String(endDate.getFullYear()),
      endDateMonth: String(endDate.getMonth() + 1).padStart(2, "0"),
      endDateDay: String(endDate.getDate()).padStart(2, "0"),
      listingDeposit: 200000,
      middlePayment: 150000,
      balancePayment: 0,
      managementTotal: 100000,
      management1: 80000,
      management2: "-",
      management3: "-",
      management4: "-",
      management5: "-",
      management6: "-",
      management7: 7000,
      management8: 13000,
      managementOther: "정기 청소 용역업체 수고비: 13,000원",
      twoWeeksLaterDate: twoWeeksLaterDate.toISOString().split("T")[0],
      twoWeeksLaterDateYear: String(twoWeeksLaterDate.getFullYear()),
      twoWeeksLaterDateMonth: String(twoWeeksLaterDate.getMonth() + 1).padStart(
        2,
        "0"
      ),
      twoWeeksLaterDateDay: String(twoWeeksLaterDate.getDate()).padStart(
        2,
        "0"
      ),
      repairNeed:
        "기본옵션 침대의 매트리스 스프링 파손, 새 것 교체(집주인 책임)",
      repairCostCoveredBy: 100000,
      repairDeadlineDate: repairDeadlineDate.toISOString().split("T")[0],
      repairDeadlineDateYear: String(repairDeadlineDate.getFullYear()),
      repairDeadlineDateMonth: String(
        repairDeadlineDate.getMonth() + 1
      ).padStart(2, "0"),
      repairDeadlineDateDay: String(repairDeadlineDate.getDate()).padStart(
        2,
        "0"
      ),
      lessorBurden:
        "매년 방역비/소독비 청구, 누수/방전 시 집주인 부담, 기타 요구사항 유선 상의",
      lesseeBurden:
        "퇴거 시 집 청소업체 청구비용 23만, 파손 가구/옵션 파악 후 개별 청구",
      contractYn: true,
      contractConclusionDate: today.toISOString().split("T")[0],
      contractConclusionDateYear: String(today.getFullYear()),
      contractConclusionDateMonth: String(today.getMonth() + 1).padStart(
        2,
        "0"
      ),
      contractConclusionDateDay: String(today.getDate()).padStart(2, "0"),
      // specialTerms:
      lessorRegNo: "941204-1159372",
      lesseeRegNo: "980122-1167521",
      agreeMediation: true,
      assetPlan: "없음.",
      detailedAddrFee: "agree",
      specialTerms:
        "퇴거 시 입주하면서 들인 짐 모두 제하고, 옵션은 사진으로 상태 체크해주세요.",
    }));
  };

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
      <div className="flex flex-col justify-evenly">
        <div className="mt-6 flex justify-end">
          <Button
            onClick={onNext}
            className="bg-amber-500 text-white hover:bg-amber-600"
          >
            다음 →
          </Button>
        </div>
        <div
          className="w-full flex flex-row justify-end text-gray-400"
          onClick={inputDummyData}
        >
          <p className="pt-3">test</p>
        </div>
      </div>
    </ComponentCard>
  );
}
