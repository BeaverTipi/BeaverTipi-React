// src/components/listing/ListingInfoSection.jsx

import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Button from "../../form/Button";

export default function ListingInfoSection({ listingVO = {}, onPostcodeSearch }) {
  return (
    <ComponentCard title="매물정보">
      {/* 매물유형 */}
      <div className="form-group mb-6">
        <Label className="font-semibold mb-1 block">매물유형 *</Label>
        <div id="lstgTypeListArea" />
      </div>

      {/* 소분류 */}
      <div className="form-group mb-6">
        <Label className="font-semibold mb-1 block">소분류 *</Label>
        <div id="lstgType2ListArea" />
      </div>

      {/* 주소 검색 */}
      <div className="form-group grid grid-cols-12 gap-2 items-center mb-6">
        <Label className="col-span-2">주소검색</Label>
        <Input
          type="text"
          className="col-span-3"
          name="lstgPostal"
          placeholder="우편번호"
          value={listingVO.lstgPostal || ""}
          disabled
        />
        <Input
          type="text"
          className="col-span-5"
          name="lstgAdd"
          placeholder="예) 번동 10-1, 강북구 번동"
          value={listingVO.lstgAdd || ""}
          disabled
        />
        <Button type="button" className="col-span-2" onClick={onPostcodeSearch}>
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
          defaultValue={listingVO.lstgAdd2 || ""}
        />
        <Input
          type="text"
          className="col-span-4"
          name="lstgRoomNum"
          placeholder="층, 호 , 실 *"
          defaultValue={listingVO.lstgRoomNum || ""}
        />
      </div>
    </ComponentCard>
  );
}