import React, { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Select from "../../form/Select";

export default function ListingTradeSection({ formData, onChange }) {
  const [tradeType, setTradeType] = useState(formData.lstgTypeSale || "");

  const handleTradeTypeChange = (e) => {
    const value = e.target.value;
    setTradeType(value);
    onChange(e);
  };

  const tradeOptions = [
    { value: "1", label: "전세" },
    { value: "2", label: "월세" },
    { value: "3", label: "매매" },
  ];

  return (
    <ComponentCard title="거래 정보">
      {/* 거래 유형 */}
      <div className="mb-6">
        <Label className="mb-1 block">거래 유형</Label>
        <Select
          name="lstgTypeSale"
          options={tradeOptions}
          placeholder="선택"
          value={formData.lstgTypeSale}
          onChange={handleTradeTypeChange}
          className="w-48"
        />
      </div>

     {/* 조건별 입력 영역 */}
<div className="mb-6 min-h-[90px]">
  {tradeType === "1" && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col">
        <Label className="mb-1">전세가</Label>
        <Input
          type="number"
          name="lstgLease"
          placeholder="전세가"
          value={formData.lstgLease}
          onChange={onChange}
        />
      </div>
    </div>
  )}

  {tradeType === "2" && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col">
        <Label className="mb-1">보증금</Label>
        <Input
          type="number"
          name="lstgLeaseAmt"
          placeholder="보증금"
          value={formData.lstgFee}
          onChange={onChange}
        />
      </div>
      <div className="flex flex-col">
        <Label className="mb-1">월세</Label>
        <Input
          type="number"
          name="lstgLeaseM"
          placeholder="월세"
          value={formData.lstgLeaseM}
          onChange={onChange}
        />
      </div>
    </div>
  )}

  {tradeType === "3" && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col">
        <Label className="mb-1">매매가</Label>
        <Input
          type="number"
          name="meme"
          placeholder="매매가"
          value={formData.meme}
          onChange={onChange}
        />
      </div>
    </div>
  )}

  {!["1", "2", "3"].includes(tradeType) && (
      <div className="flex items-center justify-center h-[90px] text-gray-400 border border-dashed rounded-md">
    거래 유형을 선택해주세요.
  </div>
  )}
</div>

      {/* 공급면적 + 총 층수 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <Label className="mb-1">공급면적 (평)</Label>
          <Input
            type="text"
            name="lstgGrArea"
            placeholder="예) 24.5"
            value={formData.lstgGrArea}
            onChange={onChange}
          />
        </div>
        <div className="flex flex-col">
          <Label className="mb-1">총 층 수 *</Label>
          <Input
            type="number"
            name="lstgFloor"
            placeholder="예) 5"
            value={formData.lstgFloor}
            onChange={onChange}
          />
        </div>
      </div>
    </ComponentCard>
  );
}
