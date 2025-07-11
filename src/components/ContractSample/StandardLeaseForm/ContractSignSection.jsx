import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Input from "../../form/input/InputField";
import FileInput from "../../form/input/FileInput"; // 서명 이미지 업로드용 컴포넌트

export default function ContractSignSection({ formData, onChange }) {
  return (
    <ComponentCard title="서명 및 날인" desc="계약 당사자의 서명 및 날인을 입력하세요.">
      <div className="text-sm space-y-6">
        <p className="text-gray-600">
          본 계약을 증명하기 위하여 계약 당사자가 이의 없음을 확인하고 각각 서명·날인 후 임대인, 임차인,
          개업공인중개사는 각자 1통씩 보관합니다.
        </p>

        {/* 날짜 입력 */}
        <div className="grid grid-cols-3 gap-4">
          <Input name="contractYear" value={formData.contractYear} onChange={onChange} placeholder="년" />
          <Input name="contractMonth" value={formData.contractMonth} onChange={onChange} placeholder="월" />
          <Input name="contractDay" value={formData.contractDay} onChange={onChange} placeholder="일" />
        </div>

        {/* 임대인 */}
        <div className="mt-6">
          <p className="font-bold mb-2">임대인</p>
          <div className="grid grid-cols-2 gap-4">
            <Input name="lessorAddress" value={formData.lessorAddress} onChange={onChange} placeholder="주소" />
            <Input name="lessorPhone" value={formData.lessorPhone} onChange={onChange} placeholder="전화번호" />
            <Input name="lessorRegNum" value={formData.lessorRegNum} onChange={onChange} placeholder="주민등록번호" />
            <Input name="lessorName" value={formData.lessorName} onChange={onChange} placeholder="성명" />
            <FileInput name="lessorSign" value={formData.lessorSign} onChange={onChange} label="서명 또는 날인" />
          </div>
        </div>

        {/* 임차인 */}
        <div className="mt-6">
          <p className="font-bold mb-2">임차인</p>
          <div className="grid grid-cols-2 gap-4">
            <Input name="lesseeAddress" value={formData.lesseeAddress} onChange={onChange} placeholder="주소" />
            <Input name="lesseePhone" value={formData.lesseePhone} onChange={onChange} placeholder="전화번호" />
            <Input name="lesseeRegNum" value={formData.lesseeRegNum} onChange={onChange} placeholder="주민등록번호" />
            <Input name="lesseeName" value={formData.lesseeName} onChange={onChange} placeholder="성명" />
            <FileInput name="lesseeSign" value={formData.lesseeSign} onChange={onChange} label="서명 또는 날인" />
          </div>
        </div>

        {/* 개업공인중개사 */}
        <div className="mt-6">
          <p className="font-bold mb-2">개업공인중개사</p>
          <div className="grid grid-cols-2 gap-4">
            <Input name="agentOffice" value={formData.agentOffice} onChange={onChange} placeholder="사무소명칭" />
            <Input name="agentOfficeAddr" value={formData.agentOfficeAddr} onChange={onChange} placeholder="사무소 소재지" />
            <Input name="agentRegNum" value={formData.agentRegNum} onChange={onChange} placeholder="등록번호" />
            <Input name="agentRep" value={formData.agentRep} onChange={onChange} placeholder="대표자 성명" />
            <Input name="agentPhone" value={formData.agentPhone} onChange={onChange} placeholder="전화번호" />
            <FileInput name="agentSign" value={formData.agentSign} onChange={onChange} label="서명 및 날인" />
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}
