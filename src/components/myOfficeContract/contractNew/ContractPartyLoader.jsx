import { useEffect } from "react";
import ComponentCard from "../../common/ComponentCard";
function ContractPartyLoader({ listing, tenancy, lessee, broker, onBack }) {

  useEffect(() => {
    console.log("📦 계약 당사자 정보:", { listing, tenancy, lessee, broker });
  }, [listing, tenancy, lessee, broker]);

  return (
    <>
      {/* 계약 입력 폼 등에 selectedListing 활용 */}
      <div className="p-6 border rounded-xl bg-white shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">📝 계약 대상</h2>
        </div>

        <div className="space-y-2 text-gray-700 dark:text-gray-200">
          <div><strong>매물명:</strong> {listing?.lstgNm || ""}</div>
          <div><strong>주소:</strong> {NewContractInfoLayout.lstg}</div>
          <div><strong>임대인:</strong> {tenancy?.mbrNm || ""}</div>
          <div><strong>임차인:</strong>{lessee.lesseeInfo?.mbrNm || ""}</div>
          <div><strong>중개인:</strong> {broker.brokerInfo?.mbrNm || ""}</div>
          <div><strong></strong></div>
          {/* 이후 계약 폼 삽입 */}
        </div>
      </div>
    </>
  );
}

export default ContractPartyLoader;