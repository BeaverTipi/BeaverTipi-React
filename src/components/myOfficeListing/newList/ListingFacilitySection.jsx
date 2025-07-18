import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Checkbox from "../../form/input/Checkbox";

export default function ListingFacilitySection({
  formData,
  onChange,
  applianceOptions = [],
  furnitureOptions = [],
  buildingOptions = []
}) {
  return (
    <ComponentCard title="시설 정보">
      {/* 전자기기 */}
      <div className="mb-6">
        <Label className="mb-2 block">전자기기</Label>
        <div className="flex flex-wrap gap-4">
          {applianceOptions.map((opt) => (
            <Checkbox
              key={opt.facOptId}
              name="appliance"
              value={opt.facOptId}
              label={opt.facOptNm}
              checked={formData.appliance?.includes(opt.facOptId)}
              onChange={onChange}
            />
          ))}
        </div>
      </div>

      {/* 가구 */}
      <div className="mb-6">
        <Label className="mb-2 block">가구</Label>
        <div className="flex flex-wrap gap-4">
          {furnitureOptions.map((opt) => (
            <Checkbox
              key={opt.facOptId}
              name="furniture"
              value={opt.facOptId}
              label={opt.facOptNm}
              checked={formData.furniture?.includes(opt.facOptId)}
              onChange={onChange}
            />
          ))}
        </div>
      </div>

      {/* 건물 부착 시설 */}
      <div className="mb-6">
        <Label className="mb-2 block">건물 부착 시설</Label>
        <div className="flex flex-wrap gap-4">
          {buildingOptions.map((opt) => (
            <Checkbox
              key={opt.facOptId}
              name="building"
              value={opt.facOptId}
              label={opt.facOptNm}
              checked={formData.building?.includes(opt.facOptId)}
              onChange={onChange}
            />
          ))}
        </div>
      </div>
    </ComponentCard>
  );
}
