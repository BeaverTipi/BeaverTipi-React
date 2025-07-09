import { useEffect } from "react";

function ContractPartyLoader({ selectedListing, onBack }) {

  useEffect(() => {
    console.log("📦 전달받은 listing:", selectedListing);
    // 여기서 selectedListing 사용하면 됨
  }, [selectedListing]);

  return (
    <>
      <h2>계약 등록 페이지</h2>
      {/* 계약 입력 폼 등에 selectedListing 활용 */}
      <div className="p-6 border rounded-xl bg-white shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">📝 계약 대상</h2>
          <button
            onClick={onBack}
            className="text-sm text-blue-500 border border-blue-500 rounded px-3 py-1 hover:bg-blue-50 dark:hover:bg-gray-800"
          >
            ← 뒤로 가기
          </button>
        </div>

        <div className="space-y-2 text-gray-700 dark:text-gray-200">
          <p><strong>매물명:</strong> {selectedListing.lstgNm}</p>
          <p><strong>임대인:</strong> {selectedListing.tenancyInfo?.mbrNm}</p>
          <p><strong>주소:</strong> {selectedListing.lstgAdd} {selectedListing.lstgAdd2}</p>
          {/* 이후 계약 폼 삽입 */}
        </div>
      </div>
    </>
  );
}

export default ContractPartyLoader;