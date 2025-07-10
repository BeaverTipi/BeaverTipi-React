import { useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
function ContractPartyLoader({ selectedListing, onBack }) {

  useEffect(() => {
    console.log("📦 전달받은 listing:", selectedListing);
    // 여기서 selectedListing 사용하면 됨
  }, [selectedListing]);

  return (
    <>
      <ComponentCard
        onBack={onBack}
      >
        {/* 계약 입력 폼 등에 selectedListing 활용 */}
        <div className="p-6 border rounded-xl bg-white shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">📝 계약 대상</h2>
          </div>

          <div className="space-y-2 text-gray-700 dark:text-gray-200">
            <div><strong>매물명:</strong> {selectedListing.lstgNm}</div>
            <div><strong>주소:</strong> {selectedListing.lstgAdd} {selectedListing.lstgAdd2}</div>
            <div><strong>임대인:</strong> {selectedListing.tenancyInfo?.mbrNm}</div>
            <div><strong>임차인:</strong></div>
            <div><strong>중개인:</strong> {selectedListing.brokerInfo?.mbrNm}</div>
            <div><strong></strong></div>
            {/* 이후 계약 폼 삽입 */}
          </div>
        </div>
      </ComponentCard>
    </>
  );
}

export default ContractPartyLoader;