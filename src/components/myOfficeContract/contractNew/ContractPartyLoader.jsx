import { useEffect } from "react";
import ComponentCard from "../../common/ComponentCard";
import { useContractInfo } from "../../../context/ContractInfoContext";
function ContractPartyLoader({ listing, tenancy, lessee, broker, onBack }) {
  const { contractInfo } = useContractInfo();
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
          <div className="flex flex-row gap-1"><div className="w-[70px] text-right"><strong>매물명:</strong>  </div><div>{contractInfo.listingName}</div></div>
          <div className="flex flex-row gap-1"><div className="w-[70px] text-right"><strong>주소:</strong>    </div><div>{contractInfo.listingAdd} </div></div>
          <div className="flex flex-row gap-1"><div className="w-[70px] text-right"><strong>임대인:</strong>  </div><div>{contractInfo.lessorName} </div></div>
          <div className="flex flex-row gap-1"><div className="w-[70px] text-right"><strong>임차인:</strong>  </div><div>{contractInfo.lesseeName} </div></div>
          <div className="flex flex-row gap-1"><div className="w-[70px] text-right"><strong>중개인:</strong>  </div><div>{contractInfo.agentName}  </div></div>
          <div className="flex flex-row gap-1"><div className="w-[70px] text-right"><strong>계약일시:</strong></div><div>{contractInfo.agentName}  </div></div>
          <div className="flex flex-row gap-1"><div className="w-[70px] text-right"><strong></strong></div>         <div></div></div>
          {/* 이후 계약 폼 삽입 */}
        </div>
      </div>
    </>
  );
}

export default ContractPartyLoader;