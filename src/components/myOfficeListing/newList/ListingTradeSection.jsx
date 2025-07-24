import React, { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Select from "../../form/Select";

export default function ListingTradeSection({ formData, onChange }) {
  const [grUnit, setGrUnit] = useState("㎡");
  const [exUnit, setExUnit] = useState("㎡");

  // 개별 금액 항목 단위 상태
  const [unitLease, setUnitLease] = useState("억"); // 전세가
  const [unitLeaseAmt, setUnitLeaseAmt] = useState("억"); // 보증금
  const [unitLeaseM, setUnitLeaseM] = useState("만원"); // 월세
  const [unitMeme, setUnitMeme] = useState("억"); // 매매가

  const [grAreaInput, setGrAreaInput] = useState(formData.lstgGrArea || "");
  const [exAreaInput, setExAreaInput] = useState(formData.lstgExArea || "");

  const tradeOptions = [
    { value: "001", label: "전세" },
    { value: "002", label: "월세" },
    { value: "003", label: "매매" },
  ];

  const convertToM2 = (py) => (py === "" ? "" : (parseFloat(py) * 3.3058).toFixed(2));
  const convertToPy = (m2) => (m2 === "" ? "" : (parseFloat(m2) / 3.3058).toFixed(2));

  const formatPrice = (value, unit) => {
    if (!value) return "";
    const num = Number(value);
    if (unit === "만원") return (num / 10000).toFixed(0);
    if (unit === "억") return (num / 100000000).toFixed(2);
    return num.toLocaleString();
  };

  const parsePrice = (value, unit) => {
    const raw = value.toString().replace(/[^\d.]/g, "");
    if (unit === "만원") return String(Math.round(Number(raw) * 10000));
    if (unit === "억") return String(Math.round(Number(raw) * 100000000));
    return raw;
  };

  const handleTradeTypeChange = (e) => {
    onChange(e);
  };

  const renderPriceInput = (label, name, value, unitState, setUnitState, units) => {
    const unit = unitState;
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <Label>
            {label} ({unit})
          </Label>
          <button
            type="button"
            onClick={() => {
              const currentIndex = units.indexOf(unit);
              const nextUnit = units[(currentIndex + 1) % units.length];
              setUnitState(nextUnit);
            }}
            className="text-xs text-blue-600 border border-gray-300 px-2 py-1 rounded hover:bg-gray-50"
          >
            {unit} 보기
          </button>
        </div>
        <Input
          type="text"
          name={name}
          placeholder={label}
          value={formatPrice(value, unit)}
          onChange={(e) =>
            onChange({ target: { name, value: parsePrice(e.target.value, unit) } })
          }
        />
      </div>
    );
  };

  return (
    <ComponentCard title="거래 정보">
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

      {/* 금액 입력 */}
      <div className="mb-6 min-h-[90px]">
        {formData.lstgTypeSale === "001" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderPriceInput("전세가", "lstgLease", formData.lstgLease, unitLease, setUnitLease, [
              "억",
              "만원",
            ])}
          </div>
        )}

        {formData.lstgTypeSale === "002" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderPriceInput(
              "보증금",
              "lstgLeaseAmt",
              formData.lstgLeaseAmt,
              unitLeaseAmt,
              setUnitLeaseAmt,
              ["억", "만원"]
            )}
            {renderPriceInput(
              "월세",
              "lstgLeaseM",
              formData.lstgLeaseM,
              unitLeaseM,
              setUnitLeaseM,
              ["만원", "원"]
            )}
          </div>
        )}

        {formData.lstgTypeSale === "003" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderPriceInput("매매가", "meme", formData.meme, unitMeme, setUnitMeme, ["억", "만원"])}
          </div>
        )}

        {!["001", "002", "003"].includes(formData.lstgTypeSale) && (
          <div className="flex items-center justify-center h-[90px] text-gray-400 border border-dashed rounded-md">
            거래 유형을 선택해주세요.
          </div>
        )}
      </div>
{/* 면적 입력 */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* 공급면적 */}
  <div className="flex flex-col">
    <div className="flex items-center justify-between mb-1">
      <Label>공급면적 ({grUnit})</Label>
      <button
        type="button"
        onClick={() => {
          const next = grUnit === "㎡" ? "평" : "㎡";
          const newVal = next === "㎡" ? convertToM2(grAreaInput) : convertToPy(grAreaInput);
          setGrUnit(next);
          setGrAreaInput(newVal);
        }}
        className="text-xs text-blue-500 border border-gray-300 px-2 py-1 rounded hover:bg-gray-100"
      >
        {grUnit === "㎡" ? "평 보기" : "㎡ 보기"}
      </button>
    </div>
    <Input
      type="number"
      placeholder={`예) ${grUnit === "㎡" ? "24.5" : "7.4"}`}
      value={grAreaInput}
      onChange={(e) => {
        const val = e.target.value;
        setGrAreaInput(val);
        const m2 = grUnit === "㎡" ? val : convertToM2(val);
        onChange({ target: { name: "lstgGrArea", value: m2 } });
      }}
    />
  </div>

  {/* 전용면적 */}
  <div className="flex flex-col">
    <div className="flex items-center justify-between mb-1">
      <Label>전용면적 ({exUnit})</Label>
      <button
        type="button"
        onClick={() => {
          const next = exUnit === "㎡" ? "평" : "㎡";
          const newVal = next === "㎡" ? convertToM2(exAreaInput) : convertToPy(exAreaInput);
          setExUnit(next);
          setExAreaInput(newVal);
        }}
        className="text-xs text-blue-500 border border-gray-300 px-2 py-1 rounded hover:bg-gray-100"
      >
        {exUnit === "㎡" ? "평 보기" : "㎡ 보기"}
      </button>
    </div>
    <Input
      type="number"
      placeholder={`예) ${exUnit === "㎡" ? "24.5" : "7.4"}`}
      value={exAreaInput}
      onChange={(e) => {
        const val = e.target.value;
        setExAreaInput(val);
        const m2 = exUnit === "㎡" ? val : convertToM2(val);
        onChange({ target: { name: "lstgExArea", value: m2 } });
      }}
    />
  </div>
</div>

    </ComponentCard>
  );
}
