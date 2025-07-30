import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Checkbox from "../../form/input/Checkbox";

export default function ListingFacilitySection({
  formData,
  onCheckboxChange,
  applianceOptions = [],
  furnitureOptions = [],
  buildingOptions = [],
}) {
  const isAllSelected = (selected, options) =>
    options.length > 0 &&
    options.every((opt) => selected.includes(opt.facOptId));

  return (
    <ComponentCard title="시설 정보">
      {/* 전자기기 */}
      <div className="mb-6">
        <Label className="mb-2 block">전자기기</Label>
        <div className="flex flex-wrap gap-4 items-center mb-2">
          <Checkbox
            name="appliance"
            value="all"
            label="전체 선택"
            checked={isAllSelected(formData.appliance, applianceOptions)}
            onChange={() => {
              const allIds = applianceOptions.map((opt) => opt.facOptId);
              const isAll = isAllSelected(formData.appliance, applianceOptions);
              allIds.forEach((id) =>
                onCheckboxChange("appliance", id, !isAll)
              );
            }}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          {applianceOptions.map((opt) => (
            <Checkbox
              key={opt.facOptId}
              name="appliance"
              value={opt.facOptId}
              label={opt.facOptNm}
              checked={formData.appliance?.includes(opt.facOptId)}
              onChange={(checked) =>
                onCheckboxChange("appliance", opt.facOptId, checked)
              }
            />
          ))}
        </div>
      </div>

      {/* 가구 */}
      <div className="mb-6">
        <Label className="mb-2 block">가구</Label>
        <div className="flex flex-wrap gap-4 items-center mb-2">
          <Checkbox
            name="furniture"
            value="all"
            label="전체 선택"
            checked={isAllSelected(formData.furniture, furnitureOptions)}
            onChange={() => {
              const allIds = furnitureOptions.map((opt) => opt.facOptId);
              const isAll = isAllSelected(formData.furniture, furnitureOptions);
              allIds.forEach((id) =>
                onCheckboxChange("furniture", id, !isAll)
              );
            }}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          {furnitureOptions.map((opt) => (
            <Checkbox
              key={opt.facOptId}
              name="furniture"
              value={opt.facOptId}
              label={opt.facOptNm}
              checked={formData.furniture?.includes(opt.facOptId)}
              onChange={(checked) =>
                onCheckboxChange("furniture", opt.facOptId, checked)
              }
            />
          ))}
        </div>
      </div>

      {/* 건물 부착 시설 */}
      <div className="mb-6">
        <Label className="mb-2 block">건물 부착 시설</Label>
        <div className="flex flex-wrap gap-4 items-center mb-2">
          <Checkbox
            name="building"
            value="all"
            label="전체 선택"
            checked={isAllSelected(formData.building, buildingOptions)}
            onChange={() => {
              const allIds = buildingOptions.map((opt) => opt.facOptId);
              const isAll = isAllSelected(formData.building, buildingOptions);
              allIds.forEach((id) =>
                onCheckboxChange("building", id, !isAll)
              );
            }}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          {buildingOptions.map((opt) => (
            <Checkbox
              key={opt.facOptId}
              name="building"
              value={opt.facOptId}
              label={opt.facOptNm}
              checked={formData.building?.includes(opt.facOptId)}
              onChange={(checked) =>
                onCheckboxChange("building", opt.facOptId, checked)
              }
            />
          ))}
        </div>
      </div>
    </ComponentCard>
  );
}
