import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
// import PDFViewer from "../components/contract/PDFViewer";
// import SignatureCanvas from "../components/contract/SignatureCanvas";
// import SignatureStatusBoard from "../components/contract/SignatureStatusBoard";
// import ContractPartyLoader from "../components/myOffice/ContractNew/ContractPartyLoader";

export default function ContractSignature() {
  const location = useLocation();
  const contId = location.state?.contId;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000); // 3초 후 로딩 false
    return () => clearTimeout(timer); // cleanup
  }, []);

  if (!contId) {
    return <div>접근이 유효하지 않습니다.</div>; // 직접 접근 차단
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <svg className="animate-spin h-10 w-10 text-white mb-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
        </svg>
        <p className="text-lg">계약 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!contId) return <div>접근이 유효하지 않습니다.</div>; // 직접 접근 차단

  return (
    <>
      <div className="min-h-screen w-full bg-gray-900 text-white p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-white">전자계약 서명{contId}</h1>

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
    </>
  );
}
