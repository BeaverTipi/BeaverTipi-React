import React from "react";
import Input from "../../form/input/InputField";
import SelectBasicStyle from "../../form/SelectBasicStyle";
import Textarea from "../../form/input/TextArea";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/button/Button";

export default function HousingContractForm({
  contractInfo,
  setContractInfo,
  handleChange,
}) {
  return (
    <ComponentCard
      title="주택임대차표준계약서"
      desc="임대인과 임차인의 계약 내용을 입력해주세요."
    >
      {/* 계약 정보 상단 */}
      <div className="mb-6 border p-8 rounded-xl bg-gray-50">
        <p className="text-center font-bold text-2xl mt-4 mb-4">
          주택임대차표준계약서
        </p>
        <div className="pt-4">
          <div className="grid grid-cols-4 gap-4 text-sm mb-4">
            <div className="col-span-1">
              <label className="font-semibold">중개인 대표(ㅇ):</label>
              <Input
                name="agentName"
                value={contractInfo?.agentName || ""}
                onChange={handleChange}
                placeholder="중개인 성명"
              />
            </div>
            <div className="col-span-1">
              <label className="font-semibold">임대인 대표(ㅇ):</label>
              <Input
                name="lessorName"
                value={contractInfo?.lessorName || ""}
                onChange={handleChange}
                placeholder="임대인 성명"
              />
            </div>
            <div className="col-span-1">
              <label className="font-semibold">임차인 대표(ㅇ):</label>
              <Input
                name="lesseeName"
                value={contractInfo?.lesseeName || ""}
                onChange={handleChange}
                placeholder="임차인 성명"
              />
            </div>
            <div className="col-span-1">
              <label className="font-semibold">계약형태:</label>
              <br />
              <SelectBasicStyle
                name="contractType"
                value={contractInfo?.contractType || ""}
                onChange={handleChange}
                placeholder="--임대 유형--"
                options={[
                  { value: "전세", label: "전세" },
                  { value: "월세", label: "월세" },
                  { value: "매매", label: "매매" },
                ]}
              />
            </div>
          </div>
        </div>
        <div className="pt-5">
          <p className="font-semibold">[임차주택의 표시]</p>
          <div className="grid grid-cols-4 gap-4 mb-2">
            <div className="col-span-4">
              <label className="col-span-4 font-bold text-sm mb-2">
                기본주소
              </label>
              <div className="flex flex-row gap-3 col-span-4">
                <Input
                  name="locationBasic"
                  className="flex-1"
                  value={contractInfo?.locationBasic || ""}
                  onChange={handleChange}
                  placeholder="임차주택 기본주소"
                />
                <Button className="invisible" disabled:true></Button>
              </div>
            </div>
            <div className="col-span-4">
              <label className="col-span-1 font-bold text-sm mb-2">
                도로명주소
              </label>
              <div className="flex flex-row gap-3 col-span-4">
                <Input
                  name="location"
                  className="flex-1"
                  value={contractInfo?.location || ""}
                  onChange={handleChange}
                  placeholder="임차주택 도로명주소"
                />
                <Button className="invisible" disabled:true></Button>
              </div>
            </div>
          </div>

          <div className="pt-5">
            <p className="font-semibold">[토지 / 건물]</p>
            <div className="grid grid-cols-4 gap-4 mb-2">
              <div className="col-span-4">
                <label className="text-sm font-bold mb-2">임차부분</label>
                <Input
                  name="rentedArea"
                  className="col-span-3"
                  value={contractInfo.rentedArea || ""}
                  onChange={handleChange}
                  placeholder="층수, 호수 등 상세"
                />
              </div>
              <div className="col-span-1">
                <label className="text-sm font-bold mb-2">지목</label>
                <Input
                  name="land"
                  value={contractInfo.land || ""}
                  onChange={handleChange}
                  placeholder="지목"
                />
              </div>
              <div className="col-span-1">
                <label className="text-sm font-bold mb-2">구조·용도</label>
                <Input
                  name="structure"
                  value={contractInfo.structure || ""}
                  onChange={handleChange}
                  placeholder="구조·용도"
                />
              </div>
              <div className="col-span-1">
                <label className="text-sm font-bold mb-2">전용면적(m²)</label>
                <Input
                  name="lstgExArea"
                  value={contractInfo.lstgExArea || ""}
                  onChange={handleChange}
                  placeholder="전용면적(m²)"
                />
              </div>
              <div className="col-span-1">
                <label className="text-sm font-bold mb-2">공급면적(m²)</label>
                <Input
                  name="lstgGrArea"
                  value={contractInfo.lstgGrArea || ""}
                  onChange={handleChange}
                  placeholder="공급면적(m²)"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-2"></div>
        </div>
      </div>
    </ComponentCard>
  );
}
