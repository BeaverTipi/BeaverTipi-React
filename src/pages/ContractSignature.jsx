import React from "react";
// import PDFViewer from "../components/contract/PDFViewer";
// import SignatureCanvas from "../components/contract/SignatureCanvas";
// import SignatureStatusBoard from "../components/contract/SignatureStatusBoard";
// import ContractPartyLoader from "../components/myOffice/ContractNew/ContractPartyLoader";

export default function ContractSignature() {
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-white">전자계약 서명</h1>

      {/* 계약 주요정보 요약 */}
      {/* <ContractPartyLoader /> */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* 좌측: PDF 미리보기 */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md overflow-auto max-h-[75vh]">
          <h2 className="text-lg font-semibold mb-4">계약서 미리보기</h2>

          {/* <PDFViewer /> */}
        </div>

        {/* 우측: 서명판 + 상태표시 */}
        <div className="flex flex-col gap-6">
          {/* 서명 여부 상태 */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">서명 상태</h2>
            {/* <SignatureStatusBoard /> */}
          </div>

          {/* 직접 서명 */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">서명하기</h2>
            {/* <SignatureCanvas /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
