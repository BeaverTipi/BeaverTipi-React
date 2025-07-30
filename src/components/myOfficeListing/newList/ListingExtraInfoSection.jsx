import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Input from "../../form/input/InputField";
import Checkbox from "../../form/input/Checkbox";
import Radio from "../../form/input/Radio";
import Label from "../../form/Label";

export default function ListingExtraInfoSection({
  formData,
  onChange,          // 일반 Input용
  onRadioChange,     // 단일 선택용 Radio
}) {
  
  return (
    <ComponentCard title="추가 정보">
      {/* 총 층수, 해당 층수, 욕실 수 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <Label className="mb-1 block">해당 층 수</Label>
          <Input
            type="number"
            name="floor"
            value={formData.lstgFloor}
            onChange={onChange}
          />
        </div>
        <div>
          <Label className="mb-1 block">욕실 수 *</Label>
          <Input
            type="number"
            name="lstgBath"
            value={formData.lstgBathCnt}
            onChange={onChange}
          />
        </div>

        <div>
          <Label className="mb-1 block">방 수</Label>
          <Input
            type="number"
            name="lstgRoomCnt"
            placeholder="방 갯수"
            value={formData.lstgRoomCnt}
            onChange={onChange}
          />
        </div>
      </div>

{/* 상태 (신축 / 리모델링) - 라디오로 변경됨 */}
<div className="mb-6">
  <Label className="mb-1 block">상태</Label>
  <div className="flex gap-4 flex-wrap">
    <Radio
      name="roomFeature"
      value="신축"
      label="신축"
      checked={formData.roomFeature === "신축"}
      onChange={(value) => onRadioChange("roomFeature", value)}
    />
    <Radio
      name="roomFeature"
      value="리모델링"
      label="리모델링"
      checked={formData.roomFeature === "리모델링"}
      onChange={(value) => onRadioChange("roomFeature", value)}
    />
  </div>
</div>


      {/* 오픈형 / 분리형 */}
      <div className="mb-6">
        <Label className="mb-1 block">방 타입</Label>
        <div className="flex gap-4 flex-wrap">
          <Radio
            name="roomType"
            value="오픈형"
            label="오픈형"
            checked={formData.roomType === "오픈형"}
            onChange={(value) => onRadioChange("roomType", value)} // ✅ props 그대로 전달
          />

          <Radio
            name="roomType"
            value="분리형"
            label="분리형"
            checked={formData.roomType === "분리형"}
            onChange={(value) => onRadioChange("roomType", value)}
          />
        </div>
      </div>
    </ComponentCard>
  );
}
