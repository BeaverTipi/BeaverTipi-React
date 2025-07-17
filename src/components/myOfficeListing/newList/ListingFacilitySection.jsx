import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Radio from "../../form/input/Radio";
import Label from "../../form/Label";
import Checkbox from "../../form/input/Checkbox";
import Input from "../../form/input/InputField"; // 🔥 직접 input 스타일을 쓸 경우

export default function ListingFacilitySection({ formData, onChange }) {
  return (
    <ComponentCard title="시설 정보">
      {/* 난방 */}
      <div className="mb-6">
        <Label className="mb-2 block">난방 시설</Label>
        <div className="flex flex-wrap gap-4">
          <Radio
            name="heating"
            value="INDIVIDUAL"
            label="개별난방"
            checked={formData.heating === "INDIVIDUAL"}
            onChange={onChange}
          />
          <Radio
            name="heating"
            value="CENTRAL"
            label="중앙난방"
            checked={formData.heating === "CENTRAL"}
            onChange={onChange}
          />
          <Radio
            name="heating"
            value="DISTRICT"
            label="지역난방"
            checked={formData.heating === "DISTRICT"}
            onChange={onChange}
          />
        </div>
      </div>

      {/* 냉방 */}
      <div className="mb-6">
        <Label className="mb-2 block">냉방 시설</Label>
        <div className="flex flex-wrap gap-4">
          <Checkbox
            name="cooling"
            value="WALL"
            label="벽걸이형"
            checked={formData.cooling.includes("WALL")}
            onChange={onChange}
          />
          <Checkbox
            name="cooling"
            value="STAND"
            label="스탠드형"
            checked={formData.cooling.includes("STAND")}
            onChange={onChange}
          />
          <Checkbox
            name="cooling"
            value="CEILING"
            label="천장형"
            checked={formData.cooling.includes("CEILING")}
            onChange={onChange}
          />
        </div>
      </div>

      {/* 주차 */}
      <div className="mb-6">
        <Label className="mb-2 block">주차 가능 여부</Label>
        <div className="flex flex-wrap items-center gap-4">
          <Radio
            name="lstgParkYn"
            value="Y"
            label="가능"
            checked={formData.lstgParkYn === "Y"}
            onChange={onChange}
          />
          <Radio
            name="lstgParkYn"
            value="N"
            label="불가능"
            checked={formData.lstgParkYn === "N"}
            onChange={onChange}
          />

          {/* ✅ 가능 선택 시에만 표시 */}
          {formData.lstgParkYn === "Y" && (
            <Input
              type="number"
              name="parkingCount"
              placeholder="주차 대 수"
              value={formData.parkingCount}
              onChange={onChange}
              className="w-40 ml-2"
            />
          )}
        </div>
      </div>
    </ComponentCard>
  );
}
