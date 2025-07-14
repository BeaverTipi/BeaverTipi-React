import React from "react";
import Input from "../../form/input/InputField";
import SelectBasicStyle from "../../form/SelectBasicStyle";
import Textarea from "../../form/input/TextArea";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/button/Button";

export default function HousingContractForm({
  formData,
  onChange,
  handleChangeLessorField,
}) {
  const onChangeA = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  console.log("formData확인:", formData);
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
                name="broker"
                value={formData.agentName}
                onChange={onChange}
                placeholder="중개인 성명"
              />
            </div>
            <div className="col-span-1">
              <label className="font-semibold">임대인 대표(ㅇ):</label>
              <Input
                name="mbrNm"
                value={formData.lessor["0"]?.mbrNm || ""}
                onChange={(e) =>
                  handleChangeLessorField("0", "mbrNm", e.target.value)
                }
                placeholder="임대인 성명"
              />
            </div>
            <div className="col-span-1">
              <label className="font-semibold">임차인 대표(ㅇ):</label>
              <Input
                name="lesseeName"
                value={formData.lesseeName}
                onChange={onChange}
                placeholder="임차인 성명"
              />
            </div>
            <div className="col-span-1">
              <label className="font-semibold">계약형태:</label>
              <br />
              <SelectBasicStyle
                name="contractType"
                value={formData.contractType}
                onChange={onChange}
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
                  value={formData.locationBasic}
                  onChange={onChange}
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
                  // value={formData.locationDetail} KakaoMapGeocoder
                  onChange={onChange}
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
                  value={formData.rentedArea}
                  onChange={onChange}
                  placeholder="층수, 호수 등 상세"
                />
              </div>
              <div className="col-span-1">
                <label className="text-sm font-bold mb-2">지목</label>
                <Input
                  name="land"
                  value={formData.land}
                  onChange={onChange}
                  placeholder="지목"
                />
              </div>
              <div className="col-span-1">
                <label className="text-sm font-bold mb-2">구조·용도</label>
                <Input
                  name="structure"
                  value={formData.structure}
                  onChange={onChange}
                  placeholder="구조·용도"
                />
              </div>
              <div className="col-span-1">
                <label className="text-sm font-bold mb-2">전용면적(m²)</label>
                <Input
                  name="lstgExArea"
                  value={formData.lstgExArea}
                  onChange={onChange}
                  placeholder="전용면적(m²)"
                />
              </div>
              <div className="col-span-1">
                <label className="text-sm font-bold mb-2">공급면적(m²)</label>
                <Input
                  name="lstgGrArea"
                  value={formData.lstgGrArea}
                  onChange={onChange}
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
