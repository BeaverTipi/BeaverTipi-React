import React from "react";
import Input from "../../form/input/InputField";
import Textarea from "../../form/input/TextArea";
import ComponentCard from "../../common/ComponentCard";

export default function ContractTermsSection({
  contractInfo,
  setContractInfo,
  handleChange,
}) {
  return (
    <ComponentCard
      title="계약 내용"
      desc="보증금, 차임, 관리비 및 유지보수 항목을 입력해주세요."
    >
      {/* 제1조 보증금, 차임 및 관리비 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">
          제1조(보증금과 차임 및 관리비)
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <label className="col-span-1 font-semibold">보증금</label>
          <Input
            name="lstgLeaseAmt"
            value={contractInfo?.lstgLeaseAmt || ""}
            onChange={handleChange}
            placeholder="원정(W)"
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <label className="col-span-1 font-semibold">계약금</label>
          <Input
            name="contDeposit"
            value={contractInfo?.contDeposit || ""}
            onChange={handleChange}
            className="col-span-3"
            placeholder="원정(W)"
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <label className="col-span-1 font-semibold">중도금</label>
          <Input
            name="middlePayment"
            value={contractInfo?.middlePayment}
            onChange={handleChange}
            className="col-span-3"
            placeholder="원정(W), 지급일 입력"
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <label className="col-span-1 font-semibold">잔금</label>
          <Input
            name="balancePayment"
            value={contractInfo?.balancePayment}
            onChange={handleChange}
            className="col-span-3"
            placeholder="원정(W), 지급일 입력"
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <label className="col-span-1 font-semibold">차임 (월세)</label>
          <Input
            name="lstgLeaseM"
            value={contractInfo?.lstgLeaseM}
            onChange={handleChange}
            className="col-span-3"
            placeholder="원정(W) 매월 ○일 지급, 계좌 포함"
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <label className="col-span-1 font-semibold">입금계좌</label>
          {formData.lessor?.["0"] && (
            <Input
              name="lessorBankAcc"
              value={contractInfo?.lessor["0"].lessorBankAcc}
              onChange={handleChange}
              className="col-span-3"
              placeholder="입금 계좌"
            />
          )}
        </div>
        {/* 관리비 */}
        <div>
          <p className="font-semibold mt-4 mb-2">관리비</p>
          <div className="grid grid-cols-2 gap-2">
            <Input
              name="management1"
              value={contractInfo?.management1 || ""}
              onChange={(e) => {
                handleChange(e);
                handleManagement(e);
              }}
              placeholder="1. 일반관리비 원정(W)"
            />
            <Input
              name="management2"
              value={contractInfo?.management2 || ""}
              onChange={(e) => {
                handleChange(e);
                handleManagement(e);
              }}
              placeholder="2. 전기료 원정(W)"
            />
            <Input
              name="management3"
              value={contractInfo?.management3 || ""}
              onChange={(e) => {
                handleChange(e);
                handleManagement(e);
              }}
              placeholder="3. 수도료 원정(W)"
            />
            <Input
              name="management4"
              value={contractInfo?.management4 || ""}
              onChange={(e) => {
                handleChange(e);
                handleManagement(e);
              }}
              placeholder="4. 가스 사용료 원정(W)"
            />
            <Input
              name="management5"
              value={contractInfo?.management5 || ""}
              onChange={(e) => {
                handleChange(e);
                handleManagement(e);
              }}
              placeholder="5. 난방비 원정(W)"
            />
            <Input
              name="management6"
              value={contractInfo?.management6 || ""}
              onChange={(e) => {
                handleChange(e);
                handleManagement(e);
              }}
              placeholder="6. 인터넷 사용료 원정(W)"
            />
            <Input
              name="management7"
              value={contractInfo?.management7 || ""}
              onChange={(e) => {
                handleChange(e);
                handleManagement(e);
              }}
              placeholder="7. TV 사용료 원정(W)"
            />
            <Input
              name="management8"
              value={contractInfo?.management8 || ""}
              onChange={(e) => {
                handleChange(e);
                handleManagement(e);
              }}
              placeholder="8. 기타관리비 원정(W)"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            관리비 TOTAL && 관리비 청구일자
          </div>
        </div>
      </div>

      {/* 제2조 임대차기간 */}
      <div className="mt-6 space-y-2">
        <h3 className="font-semibold text-sm">제2조(임대차기간)</h3>
        <div className="grid grid-cols-4 gap-4">
          <label className="col-span-1">임대기간 시작일</label>
          <Input
            name="startDate"
            value={contractInfo?.startDate || ""}
            onChange={handleChange}
            placeholder="YYYY-MM-DD"
          />
          <label className="col-span-1">종료일</label>
          <Input
            name="endDate"
            value={contractInfo?.endDate || ""}
            onChange={handleChange}
            placeholder="YYYY-MM-DD"
          />
        </div>
      </div>

      {/* 제3조 목적물의 유지보수 */}
      <div className="mt-6 space-y-2">
        <h3 className="font-semibold text-sm">제3조(목적물 유지·수리)</h3>
        <div className="grid grid-cols-1 gap-2">
          <Textarea
            name="repairNeed"
            value={contractInfo?.repairNeed || ""}
            onChange={handleChange}
            placeholder="수리 필요 시설명 / 수리 범위 입력"
          />
          <div className="grid grid-cols-4 gap-4">
            <label className="col-span-1">수리 완료 시기</label>
            <Input
              name="repairDeadline"
              value={contractInfo?.repairDeadline || ""}
              onChange={handleChange}
              placeholder="YYYY-MM-DD 또는 기타"
            />
            <label className="col-span-1">임대인이 부담</label>
            <Input
              name="repairCostCoveredBy"
              value={contractInfo?.repairCostCoveredBy || ""}
              onChange={handleChange}
              placeholder="보증금 또는 차임에서 공제"
            />
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}
