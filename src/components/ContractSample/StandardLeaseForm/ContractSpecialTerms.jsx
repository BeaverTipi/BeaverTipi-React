import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Input from "../../form/input/InputField";
import Textarea from "../../form/input/TextArea";
import Radio from "../../form/input/Radio";
import Checkbox from "../../form/input/CheckBox";

export default function ContractSpecialTerms({
  contractInfo,
  setContractInfo,
  handleChange,
}) {
  const now = new Date();
  const moveInDeadline = new Date(now);
  moveInDeadline.setDate(now.getDate() + 14);
  return (
    <ComponentCard
      title="특약사항"
      desc="임대인과 임차인 간의 특약 내용을 명시해주세요."
    >
      <div className="space-y-4 text-sm">
        {/* 전입신고 및 확정일자 */}
        <div className="grid grid-cols-4 gap-4 items-end">
          <label className="col-span-1 font-semibold">전입신고 마감일</label>
          <Input
            name="moveInDeadline"
            value={contractInfo?.moveInDeadline || moveInDeadline}
            onChange={onChange}
            placeholder="YYYY-MM-DD"
            className="col-span-2"
          />
        </div>

        {/* 특약사항 텍스트 */}
        <Textarea
          name="specialTerms"
          value={contractInfo?.specialTerms || ""}
          onChange={onChange}
          placeholder="예: 임차인이 전입신고 및 확정일자를 기한 내 완료하지 않을 경우 임대차계약이 해지될 수 있습니다."
          rows={6}
        />

        {/* 주택임대차분쟁조정위 관련 */}
        <div>
          <label className="font-semibold block mb-2">조정 신청 여부</label>
          <Checkbox
            name="agreeMediation"
            checked={contractInfo?.agreeMediation || ""}
            onChange={onChange}
            label="조정 신청에 동의합니다 (그릇된 분쟁 방지 목적)"
          />
        </div>

        {/* 주택 및 그 외 자산에 관한 구체적 계획 */}
        <div className="space-y-2">
          <label className="font-semibold">추후 자산 계획</label>
          <Textarea
            name="assetPlan"
            value={contractInfo?.assetPlan || ""}
            onChange={onChange}
            placeholder="예: 매물 2호점 구축 계획 등..."
            rows={2}
          />
        </div>

        {/* 상세주소수수료 관련 체크 */}
        <div className="grid grid-cols-2 gap-4">
          <label className="font-semibold col-span-1">
            상세주소가 없는 경우, 상세주소 수수료에 대한 소유자 동의 여부
          </label>
          <div className="flex gap-4 items-center">
            <Radio
              name="detailedAddrFee"
              value="agree"
              checked={contractInfo?.detailedAddrFee === "agree"}
              onChange={onChange}
              label="동의"
            />
            <Radio
              name="detailedAddrFee"
              value="disagree"
              checked={contractInfo?.detailedAddrFee === "disagree"}
              onChange={onChange}
              label="미동의"
            />
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}
