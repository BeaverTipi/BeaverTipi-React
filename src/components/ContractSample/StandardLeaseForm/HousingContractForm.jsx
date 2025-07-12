import React from "react";
import Input from "../../form/input/InputField";
import Select from "../../form/Select";
import Textarea from "../../form/input/TextArea";
import ComponentCard from "../../common/ComponentCard";

export default function HousingContractForm({ formData, onChange }) {
  console.log("formData확인:", formData);
  return (
    <ComponentCard
      title="주택임대차표준계약서"
      desc="임대인과 임차인의 계약 내용을 입력해주세요."
    >
      {/* 계약 정보 상단 */}
      <div className="mb-6 border p-8 rounded-xl bg-gray-50">
        <p className="text-center font-bold text-lg mb-4">주택임대차표준계약서</p>
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div className="col-span-1">
            <label className="font-semibold">임대인(ㅇ):</label>
            <Input name="lessor" value={formData.lessorName} onChange={onChange} placeholder="임대인 성명" />
          </div>
          <div className="col-span-1">
            <label className="font-semibold">임차인(ㅇ):</label>
            <Input name="lessee" value={formData.lesseeName} onChange={onChange} placeholder="임차인 성명" />
          </div>
          <div className="col-span-1">
            <label className="font-semibold">계약형태:</label>
            <Select
              name="contractType"
              value={formData.contractType}
              onChange={onChange}
              options={[
                { value: "monthly", label: "월세" },
                { value: "jeonse", label: "전세" },
              ]}
            />
          </div>
        </div>
        <div className="pt-5">
          <p className="font-bold text-sm mb-2">[입차주택의 표시]</p>
          <div className="grid grid-cols-4 gap-4 mb-2">
            <label className="col-span-1 font-semibold">소재지</label>
            <Input
              name="location"
              className="col-span-3"
              value={formData.location}
              onChange={onChange}
              placeholder="도로명주소"
            />
          </div>
          <div className="grid grid-cols-4 gap-4 mb-2">
            <label className="col-span-1 font-semibold">토지 / 건물</label>
            <div className="col-span-1">
              <Input name="land" value={formData.land} onChange={onChange} placeholder="지목" />
            </div>
            <div className="col-span-1">
              <Input name="structure" value={formData.structure} onChange={onChange} placeholder="구조·용도" />
            </div>
            <div className="col-span-1">
              <Input name="area" value={formData.area} onChange={onChange} placeholder="면적(m²)" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-2">
            <label className="col-span-1 font-semibold">임차부분</label>
            <Input
              name="rentedArea"
              className="col-span-3"
              value={formData.rentedArea}
              onChange={onChange}
              placeholder="층수, 호수 등 상세"
            />
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}
