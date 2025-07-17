// src/components/myOfficeListing/ListingDescriptionSection.jsx

import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import TextArea from "../../form/input/TextArea";
import Input from "../../form/input/InputField";

export default function ListingDescriptionSection({ formData, onChange }) {
  return (
    <ComponentCard title="상세 설명">
      {/* 제목 */}
      <div className="mb-6">
        <Label htmlFor="lstgNm" className="mb-2 block">
          제목 *
        </Label>
        <Input
          id="lstgNm"
          name="lstgNm"
          placeholder="제목을 입력하세요"
          maxLength={40}
          value={formData.lstgNm}
          onChange={onChange}
        />
      </div>

      {/* 상세 설명 */}
      <div className="mb-6">
        <Label htmlFor="lstgDst" className="mb-2 block">
          상세 설명
        </Label>
        <TextArea
          placeholder="상세 설명을 입력하세요"
          rows={6}
          value={formData.lstgDst}
          onChange={(val) =>
            onChange({ target: { name: "lstgDst", value: val } })
          }
        />
      </div>
    </ComponentCard>
  );
}
