// src/components/listing/ListingInfoSection.jsx

import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Button from "../../form/Button";
import Radio from "../../form/input/Radio";
export default function ListingInfoSection({
  formData,
  onRadioChange,
  commonCodes,
  onAddressSearch,
  filteredLstgType2,
  onChange
}) {
  console.log("공통코드", commonCodes.lstgType1, commonCodes.lstgType2);

  return (
    <ComponentCard title="매물정보">
      <div className="form-group mb-6">
        <Label className="font-semibold mb-1 block">매물유형 *</Label>
        <div className="flex flex-wrap gap-4">
          {commonCodes.lstgType1
            .filter((item) => item.codeValue !== "000")
            .map((item) => (
              <Radio
                key={`${item.codeGroup}${item.codeValue}`}
                name="lstgTypeCode1"
                value={item.codeValue}
                label={item.codeName}
                checked={formData.lstgTypeCode1 === item.codeValue}
                onChange={(val) => onRadioChange("lstgTypeCode1", val)}
              />
            ))}
        </div>
      </div>

{/* ✅ 소분류 */}
<div className="form-group mb-6">
  <Label className="font-semibold mb-1 block">매물 소분류 *</Label>

  {filteredLstgType2.length === 0 ? (
    // ✅ 대분류 선택 안된 경우
    <div className="text-sm text-gray-500">대분류를 먼저 선택해주세요.</div>
  ) : (
    // ✅ 선택된 대분류에 해당하는 소분류 라디오 버튼들
    <div className="flex flex-wrap gap-4">
      {filteredLstgType2.map((item) => (
        <Radio
          key={`${item.codeGroup}${item.codeValue}`}
          name="lstgTypeCode2"
          value={item.codeValue}
          checked={formData.lstgTypeCode2 === item.codeValue}
          onChange={() => onRadioChange("lstgTypeCode2", item.codeValue)}
          label={item.codeName}
        />
      ))}
    </div>
  )}
</div>


      {/* 주소 검색 */}
      <div className="form-group grid grid-cols-12 gap-2 items-center mb-6">
        <Label className="col-span-2">주소검색</Label>
        <Input
          type="text"
          className="col-span-3"
          name="lstgPostal"
          placeholder="우편번호"
          value={formData.lstgPostal || ""}
          disabled
        />
        <Input
          type="text"
          className="col-span-5"
          name="lstgAdd"
          placeholder="예) 번동 10-1, 강북구 번동"
          value={formData.lstgAdd || ""}
          disabled
        />
        <Button type="button" className="col-span-2" onClick={onAddressSearch}>
          검색
        </Button>
      </div>

      {/* 상세 주소 */}
      <div className="form-group grid grid-cols-12 gap-2">
        <Label className="col-span-2">상세주소</Label>
        <Input
          type="text"
          className="col-span-6"
          name="lstgAdd2"
          placeholder="상세 주소 입력"
          defaultValue={formData.lstgAdd2 || ""}
           onChange={onChange}
        />
        <Input
          type="text"
          className="col-span-4"
          name="lstgRoomNum"
          placeholder="층, 호 , 실 *"
          defaultValue={formData.lstgRoomNum || ""}
           onChange={onChange}
        />
      </div>
    </ComponentCard>
  );
}
