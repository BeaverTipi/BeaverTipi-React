import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Input from "../../form/input/InputField";
import FileInput from "../../form/input/FileInput"; // 서명 이미지 업로드용 컴포넌트

export default function ContractSignSection({
  contractInfo,
  setContractInfo,
  handleChange,
}) {
  return (
    <ComponentCard
      title="서명 및 날인"
      desc="계약 당사자의 서명 및 날인을 입력하세요."
    >
      <div className="text-sm space-y-6">
        <p className="text-gray-600">
          본 계약을 증명하기 위하여 계약 당사자가 이의 없음을 확인하고 각각
          서명·날인 후 임대인, 임차인, 개업공인중개사는 각자 1통씩 보관합니다.
        </p>

        {/* 날짜 입력 */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            name="contractYear"
            value={contractInfo?.contractYear || ""}
            onChange={handleChange}
            placeholder="년"
          />
          <Input
            name="contractMonth"
            value={contractInfo?.contractMonth || ""}
            onChange={handleChange}
            placeholder="월"
          />
          <Input
            name="contractDay"
            value={contractInfo?.contractDay || ""}
            onChange={handleChange}
            placeholder="일"
          />
        </div>

        {/* 임대인 */}
        <div className="mt-6">
          <p className="font-bold mb-2">임대인</p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="lessorAddr"
              value={contractInfo?.lessorAddr || ""}
              onChange={handleChange}
              placeholder="주소"
            />
            <Input
              name="lessorTelNo"
              value={contractInfo?.lessorTelNo || ""}
              onChange={handleChange}
              placeholder="전화번호"
            />
            <Input
              name="lessorRegNo"
              value={contractInfo?.lessorRegNo || ""}
              onChange={handleChange}
              placeholder="주민등록번호"
            />
            <Input
              name="lessorName"
              value={contractInfo?.lessorName || ""}
              onChange={handleChange}
              placeholder="성명"
            />
            {/* <FileInput
              name="lessorSign"
              value={contractInfo?.lessorSign || ""}
              onChange={handleChange}
              label="서명 또는 날인"
            /> */}
          </div>
        </div>

        {/* 임차인 */}
        <div className="mt-6">
          <p className="font-bold mb-2">임차인</p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="lesseeAddr"
              value={contractInfo?.lesseeAddr || ""}
              onChange={handleChange}
              placeholder="주소"
            />
            <Input
              name="lesseeTelNo"
              value={contractInfo?.lesseeTelNo || ""}
              onChange={handleChange}
              placeholder="전화번호"
            />
            <Input
              name="lesseeRegNo"
              value={contractInfo?.lesseeRegNo || ""}
              onChange={handleChange}
              placeholder="주민등록번호"
            />
            <Input
              name="lesseeName"
              value={contractInfo?.lesseeName || ""}
              onChange={handleChange}
              placeholder="성명"
            />
            {/* <FileInput
              name="lesseeSign"
              value={contractInfo?.lesseeSign || ""}
              onChange={handleChange}
              label="서명 또는 날인"
            /> */}
          </div>
        </div>

        {/* 개업공인중개사 */}
        <div className="mt-6">
          <p className="font-bold mb-2">개업공인중개사</p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="agentOfficeName"
              value={contractInfo?.agentOfficeName || ""}
              onChange={handleChange}
              placeholder="사무소명칭"
            />
            <Input
              name="agentOfficeAddr"
              value={contractInfo?.agentOfficeAddr || ""}
              onChange={handleChange}
              placeholder="사무소 소재지"
            />
            <Input
              name="agentRegNo"
              value={contractInfo?.agentRegNo || ""}
              onChange={handleChange}
              placeholder="등록번호"
            />
            <Input
              name="agentName"
              value={contractInfo?.agentName || ""}
              onChange={handleChange}
              placeholder="대표자 성명"
            />
            <Input
              name="agentTelNo"
              value={contractInfo?.agagentTelNoentPhone || ""}
              onChange={handleChange}
              placeholder="전화번호"
            />
            {/* <FileInput
              name="agentSign"
              value={contractInfo?.agentSign || ""}
              onChange={handleChange}
              label="서명 및 날인"
            /> */}
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}
