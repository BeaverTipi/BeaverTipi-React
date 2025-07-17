import { useEffect, useState } from "react";
import { useSecureAxios } from "../../hooks/useSecureAxios";

export default function ListingDetails({
  lstgId,
  getListingTypeName,
  getProdStatCodesName,
  getTypeSaleCodeName,
  onNext,
  onPrev,
  currentIndex,
  totalCount,
}) {
  const axios = useSecureAxios();
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (lstgId) {
      axios
        .post("/lstg/listing-details", { lstgId })
        .then((data) => {
          setDetail(data);
          console.log("✅ 조회된 매물 ID:", lstgId);
        })
        .catch((err) => {
          console.error("❌ 상세 조회 실패:", err);
        });
    }
  }, [lstgId]);

  if (!detail)
    return <div className="p-4">🔄 불러오는 중...</div>;
function InfoItem({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 dark:text-gray-400 w-32">{label}:</span>
      <span className="text-gray-800 dark:text-gray-100">{value ?? "정보 없음"}</span>
    </div>
  );
}

  return (
<div className="container-wrap max-w-3xl mx-auto px-6 py-8 space-y-8 text-base">
    <div className="w-full max-w-3xl px-6 space-y-8 text-base">
  <div className="border-b pb-4">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
      {detail.lstgNm}
    </h2>
    <p className="text-base text-gray-500 dark:text-gray-300">
      매물 ID: {detail.lstgId}
    </p>
  </div>

  {/* 이미지 */}
  {detail.lstgThumbnailUrl && (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <img
        src={detail.lstgThumbnailUrl}
        alt={`${detail.lstgNm} 썸네일`}
        className="w-full h-auto object-cover"
      />
    </div>
  )}

  <div className="space-y-4">
    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">기본 정보</h3>
    <div className="grid grid-cols-2 gap-y-2">
      <InfoItem label="주소" value={`${detail.lstgAdd} ${detail.lstgAdd2 || ""}`} />
      <InfoItem label="우편번호" value={detail.lstgPostal} />
      <InfoItem label="층수" value={detail.lstgFloor} />
      <InfoItem label="방 수" value={detail.lstgRoomCnt} />
      <InfoItem label="호실" value={detail.lstgRoomNm} />
    </div>
  </div>

  <div className="space-y-4">
    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">면적 및 금액</h3>
    <div className="grid grid-cols-2 gap-y-2">
      <InfoItem label="공급면적" value={detail.lstgGArea != null ? `${detail.lstgGArea}㎡` : "정보 없음"} />
      <InfoItem label="전용면적" value={detail.lstgExArea != null ? `${detail.lstgExArea}㎡` : "정보 없음"} />
      <InfoItem label="보증금" value={detail.lstgLeaseAmt != null ? `${detail.lstgLeaseAmt}만원` : "정보 없음"} />
      <InfoItem label="월세" value={detail.lstgLeaseM != null ? `${detail.lstgLeaseM}만원` : "정보 없음"} />
      <InfoItem label="관리비" value={detail.lstgFee != null ? `${detail.lstgFee}만원` : "없음"} />
    </div>
  </div>

  <div className="space-y-4">
    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">유형 및 상태</h3>
    <div className="grid grid-cols-2 gap-y-2">
      <InfoItem label="매물유형" value={getListingTypeName(detail.lstgTypeCode1)} />
      <InfoItem label="상세유형" value={getListingTypeName(detail.lstgTypeCode2)} />
      <InfoItem label="거래유형" value={getTypeSaleCodeName(detail.lstgTypeSale)} />
      <InfoItem label="등록상태" value={getProdStatCodesName(detail.lstgProdStat)} />
      <InfoItem label="등록일자" value={detail.lstgRegDate} />
      <InfoItem label="임대인코드" value={detail.rentalPtyId ?? "정보 없음"} />
      <InfoItem label="주차 가능 여부" value={detail.lstgParkYn === "Y" ? "가능" : "불가능"} />
    </div>
  </div>

  {Array.isArray(detail.facOptions) && detail.facOptions.length > 0 && (
    <div>
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">시설 옵션</h3>
      <ul className="list-disc list-inside text-base text-gray-600 dark:text-gray-300 pl-2">
        {detail.facOptions.map((fac, idx) => (
          <li key={idx}>
            <span className="font-medium">{fac.facOptNm}</span>
            {fac.facOptDesc && ` - ${fac.facOptDesc}`}
          </li>
        ))}
      </ul>
    </div>
  )}
  </div>
<div className="fixed bottom-10 left-30 right-30 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between z-50">
    {currentIndex > 0 ? (
      <button
        className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
        onClick={onPrev}
      >
        ← 이전 매물
      </button>
    ) : <div />}

    {currentIndex < totalCount - 1 ? (
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={onNext}
      >
        다음 매물 →
      </button>
    ) : <div />}
  </div>
  </div>

  );
}
