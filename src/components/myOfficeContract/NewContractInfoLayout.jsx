import React from "react";
import ContractPartyLoader from "./ContractPartyLoader";
import ContractFileUpLoader from "./ContractFileUpLoader";
import ContractPDFLoader from "./ContractPDFLoader";

function NewContractInfoLayout() {
  return (
    <div className="flex flex-col gap-6 px-6 py-4">
      {/* 1번 계약자 정보 입력 */}
      <ContractPartyLoader />

      <div className="flex flex-row gap-6 w-full">
        {/* 3번: 계약 폼 영역 */}
        <div className="flex-1 space-y-6">
          <ContractFileUpLoader />
        </div>

        {/* 2번: 계약서 PDF 미리보기 */}
        <div className="w-[600px] border rounded-md overflow-hidden shadow-md bg-white">
          <ContractPDFLoader />
        </div>
      </div>

      {/* 5번: 버튼 */}
      <div className="flex justify-between pt-4">
        <div></div>
        <div className="flex gap-3">
          <button className="bg-orange-400 text-white px-5 py-2 rounded-md hover:bg-orange-500">확인</button>
          <button className="bg-pink-400 text-white px-5 py-2 rounded-md hover:bg-pink-500">리셋</button>
          <button className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600">계약서 등록</button>
        </div>
      </div>
    </div>
  );
}

export default NewContractInfoLayout;
