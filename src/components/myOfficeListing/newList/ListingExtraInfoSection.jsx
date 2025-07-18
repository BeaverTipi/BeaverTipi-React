// src/components/myOfficeListing/ListingExtraInfoSection.jsx

import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Input from "../../form/input/InputField";
import Checkbox from "../../form/input/Checkbox";
import Radio from "../../form/input/Radio";
import Label from "../../form/Label";

export default function ListingExtraInfoSection({ formData, onChange }) {
  return (
    <ComponentCard title="추가 정보">
      {/* 총 층수, 해당 층수, 욕실 수 */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        <div>
          <Label className="mb-1 block">해당 층 수</Label>
          <Input
            type="number"
            name="floor"
            value={formData.floor}
            onChange={onChange}
          />
        </div>
        <div>
          <Label className="mb-1 block">욕실 수 *</Label>
          <Input
            type="number"
            name="lstgBath"
            value={formData.lstgBath}
            onChange={onChange}
          />
        </div>
      {/* 방 수 */}
      <div className="mb-6">
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


      {/* 신축 / 리모델링 체크박스 */}
      <div className="mb-6">
        <Label className="mb-1 block">상태</Label>
        <div className="flex gap-4 flex-wrap">
          <Checkbox
            name="roomFeature"
            value="신축"
            label="신축"
            checked={formData.roomFeature?.includes("신축")}
            onChange={onChange}
          />
          <Checkbox
            name="roomFeature"
            value="리모델링"
            label="리모델링"
            checked={formData.roomFeature?.includes("리모델링")}
            onChange={onChange}
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
            onChange={onChange}
          />
          <Radio
            name="roomType"
            value="분리형"
            label="분리형"
            checked={formData.roomType === "분리형"}
            onChange={onChange}
          />
        </div>
      </div>


    </ComponentCard>
  );
}
