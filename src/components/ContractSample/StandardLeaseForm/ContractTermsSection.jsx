import React from "react";
import Input from "../../form/input/InputField";
import Textarea from "../../form/input/TextArea";
import ComponentCard from "../../common/ComponentCard";

export default function ContractTermsSection() {
  return (
    <ComponentCard
      title="계약 내용"
      desc="보증금, 차임, 관리비 및 유지보수 항목을 입력해주세요."
    >
      {/* 제1조 보증금, 차임 및 관리비 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">제1조(보증금과 차임 및 관리비)</h3>
        <div className="grid grid-cols-4 gap-4">
          <label className="col-span-1 font-semibold">보증금</label>
          <Input name="deposit" placeholder="원정(W)" className="col-span-3" />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <label className="col-span-1 font-semibold">계약금</label>
          <Input name="contractDeposit" className="col-span-3" placeholder="원정(W) 및 영수인 성명" />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <label className="col-span-1 font-semibold">중도금</label>
          <Input name="middlePayment" className="col-span-3" placeholder="원정(W), 지급일 입력" />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <label className="col-span-1 font-semibold">잔금</label>
          <Input name="balancePayment" className="col-span-3" placeholder="원정(W), 지급일 입력" />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <label className="col-span-1 font-semibold">차임 (월세)</label>
          <Input name="monthlyRent" className="col-span-3" placeholder="원정(W) 매월 ○일 지급, 계좌 포함" />
        </div>

        {/* 관리비 */}
        <div>
          <p className="font-semibold mt-4 mb-2">관리비</p>
          <div className="grid grid-cols-2 gap-2">
            <Input name="management1" placeholder="1. 일반관리비 원정(W)" />
            <Input name="management2" placeholder="2. 전기료 원정(W)" />
            <Input name="management3" placeholder="3. 수도료 원정(W)" />
            <Input name="management4" placeholder="4. 가스 사용료 원정(W)" />
            <Input name="management5" placeholder="5. 난방비 원정(W)" />
            <Input name="management6" placeholder="6. 인터넷 사용료 원정(W)" />
            <Input name="management7" placeholder="7. TV 사용료 원정(W)" />
            <Input name="management8" placeholder="8. 기타관리비 원정(W)" />
          </div>
        </div>
      </div>

      {/* 제2조 임대차기간 */}
      <div className="mt-6 space-y-2">
        <h3 className="font-semibold text-sm">제2조(임대차기간)</h3>
        <div className="grid grid-cols-4 gap-4">
          <label className="col-span-1">임대기간 시작일</label>
          <Input name="startDate" placeholder="YYYY-MM-DD" />
          <label className="col-span-1">종료일</label>
          <Input name="endDate" placeholder="YYYY-MM-DD" />
        </div>
      </div>

      {/* 제3조 목적물의 유지보수 */}
      <div className="mt-6 space-y-2">
        <h3 className="font-semibold text-sm">제3조(목적물 유지·수리)</h3>
        <div className="grid grid-cols-1 gap-2">
          <Textarea name="repairNeed" placeholder="수리 필요 시설명 / 수리 범위 입력" />
          <div className="grid grid-cols-4 gap-4">
            <label className="col-span-1">수리 완료 시기</label>
            <Input name="repairDeadline" placeholder="YYYY-MM-DD 또는 기타" />
            <label className="col-span-1">임대인이 부담</label>
            <Input name="repairCostCoveredBy" placeholder="보증금 또는 차임에서 공제" />
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}
