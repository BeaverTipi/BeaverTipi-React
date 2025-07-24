import { useEffect, useRef, useState } from "react";
import { useSecureAxios } from "../../hooks/useSecureAxios";
import { useNavigate } from "react-router";
import Slider from "react-slick";
import dayjs from "dayjs";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function ListingDetails({
  lstgId,
  getListingTypeName,
  getListingDetailTypeName,
  getProdStatCodesName,
  getTypeSaleCodeName,
  onNext,
  onPrev,
  currentIndex,
  totalCount,
}) {
  const axios = useSecureAxios();
  const navigate = useNavigate();
  const sliderRef = useRef();
  const [detail, setDetail] = useState(null);
  const [depositUnit, setDepositUnit] = useState("억");
  const [monthlyUnit, setMonthlyUnit] = useState("만원");
  const [saleUnit, setSaleUnit] = useState("억");
  const [grUnit, setGrUnit] = useState("㎡");
  const [exUnit, setExUnit] = useState("㎡");

  useEffect(() => {
    if (lstgId) {
      axios.post("/lstg/listing-details", { lstgId })
        .then((data) => setDetail(data))
        .catch((err) => console.error("❌ 상세 조회 실패:", err));
    }
  }, [lstgId]);

  const formatUnitMoney = (amount, unit) => {
    if (amount == null || isNaN(amount)) return "정보 없음";
    const num = Number(amount);
    if (unit === "억") return `${(num / 100000000).toFixed(2)}억`;
    if (unit === "만원") return `${(num / 10000).toFixed(0)}만원`;
    if (unit === "원") return `₩${num.toLocaleString()}`;
    return num.toLocaleString();
  };

  const convertToPy = (m2) => (m2 === "" ? "" : (parseFloat(m2) / 3.3058).toFixed(2));

  const PriceItem = ({ label, value, unit, onUnitToggle, toggleText }) => (
    <div className="flex justify-between items-center gap-2">
      <div className="flex flex-col">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-gray-800 dark:text-gray-100">{formatUnitMoney(value, unit)}</span>
      </div>
      <button
        className="text-xs text-blue-500 border border-gray-300 px-2 py-1 rounded hover:bg-gray-100"
        onClick={onUnitToggle}
        type="button"
      >
        {toggleText}
      </button>
    </div>
  );

  const AreaItem = ({ label, value, unit, onToggle, toggleText }) => (
    <div className="flex justify-between items-center gap-2">
      <div className="flex flex-col">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-gray-800 dark:text-gray-100">{value != null ? `${value}${unit}` : "정보 없음"}</span>
      </div>
      <button
        className="text-xs text-blue-500 border border-gray-300 px-2 py-1 rounded hover:bg-gray-100"
        onClick={onToggle}
        type="button"
      >
        {toggleText}
      </button>
    </div>
  );

  const InfoItem = ({ label, value }) => (
    <div className="flex gap-2">
      <span className="text-gray-500 dark:text-gray-400 w-32">{label}:</span>
      <span className="text-gray-800 dark:text-gray-100">{value ?? "정보 없음"}</span>
    </div>
  );

  if (!detail) return <div className="p-4">🔄 불러오는 중...</div>;

  return (
    <div className="container-wrap max-w-3xl mx-auto px-6 py-8 space-y-8 text-base">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{detail.lstgNm}</h2>
        <p className="text-base text-gray-500 dark:text-gray-300">매물 ID: {detail.lstgId}</p>
      </div>

      {Array.isArray(detail.listingFiles) && detail.listingFiles.length > 0 && (
        <div className="max-w-md mx-auto">
          <Slider
            ref={sliderRef}
            dots
            arrows
            infinite
            speed={500}
            slidesToShow={1}
            slidesToScroll={1}
            className="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
          >
            {detail.listingFiles.map((file, idx) => (
              <div key={idx}>
                <img
                  src={file.filePathUrl}
                  alt={`이미지 ${idx + 1}`}
                  className="w-full h-auto object-cover cursor-pointer"
                  onClick={() => sliderRef.current?.slickNext()}
                />
              </div>
            ))}
          </Slider>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">기본 정보</h3>
        <div className="grid grid-cols-2 gap-y-2">
          <InfoItem label="주소" value={`${detail.lstgAdd} ${detail.lstgAdd2 || ""}`} />
          <InfoItem label="우편번호" value={detail.lstgPostal} />
          <InfoItem label="층수" value={detail.lstgFloor} />
          <InfoItem label="방 수" value={detail.lstgRoomCnt} />
          <InfoItem label="호실" value={detail.lstgRoomNum} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">면적 및 금액</h3>
        <div className="grid grid-cols-2 gap-y-2">
          <AreaItem
            label="공급면적"
            value={grUnit === "㎡" ? detail.lstgGArea : convertToPy(detail.lstgGArea)}
            unit={grUnit}
            onToggle={() => setGrUnit((prev) => (prev === "㎡" ? "평" : "㎡"))}
            toggleText={`${grUnit === "㎡" ? "평 보기" : "㎡ 보기"}`}
          />
          <AreaItem
            label="전용면적"
            value={exUnit === "㎡" ? detail.lstgExArea : convertToPy(detail.lstgExArea)}
            unit={exUnit}
            onToggle={() => setExUnit((prev) => (prev === "㎡" ? "평" : "㎡"))}
            toggleText={`${exUnit === "㎡" ? "평 보기" : "㎡ 보기"}`}
          />

          {detail.lstgTypeSale === "001" && (
            <PriceItem
              label="전세가"
              value={detail.lstgLeaseAmt}
              unit={depositUnit}
              onUnitToggle={() => setDepositUnit((prev) => (prev === "억" ? "만원" : prev === "만원" ? "원" : "억"))}
              toggleText={depositUnit === "억" ? "만원 보기" : depositUnit === "만원" ? "원 보기" : "억 보기"}
            />
          )}

          {detail.lstgTypeSale === "002" && (
            <>
              <PriceItem
                label="보증금"
                value={detail.lstgLeaseAmt}
                unit={depositUnit}
                onUnitToggle={() => setDepositUnit((prev) => (prev === "억" ? "만원" : prev === "만원" ? "원" : "억"))}
                toggleText={depositUnit === "억" ? "만원 보기" : depositUnit === "만원" ? "원 보기" : "억 보기"}
              />
              <PriceItem
                label="월세"
                value={detail.lstgLeaseM}
                unit={monthlyUnit}
                onUnitToggle={() => setMonthlyUnit((prev) => (prev === "만원" ? "원" : "만원"))}
                toggleText={monthlyUnit === "만원" ? "원 보기" : "만원 보기"}
              />
            </>
          )}

          {detail.lstgTypeSale === "003" && (
            <PriceItem
              label="매매가"
              value={detail.meme}
              unit={saleUnit}
              onUnitToggle={() => setSaleUnit((prev) => (prev === "억" ? "만원" : "억"))}
              toggleText={saleUnit === "억" ? "만원 보기" : "억 보기"}
            />
          )}

          <InfoItem label="관리비" value={detail.lstgFee != null ? formatUnitMoney(detail.lstgFee, "원") : "없음"} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">유형 및 상태</h3>
        <div className="grid grid-cols-2 gap-y-2">
          <InfoItem label="매물유형" value={getListingTypeName(detail.lstgTypeCode1)} />
          <InfoItem label="상세유형" value={getListingDetailTypeName(detail.lstgTypeCode2)} />
          <InfoItem label="거래유형" value={getTypeSaleCodeName(detail.lstgTypeSale)} />
          <InfoItem label="등록상태" value={getProdStatCodesName(detail.lstgProdStat)} />
          <InfoItem label="등록일자" value={dayjs(detail.lstgRegDate).format("YYYY-MM-DD")} />
          <InfoItem label="임대인이름" value={detail.tenancyInfo?.mbrNm || "정보 없음"} />
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

      <div className="sticky bottom-0 bg-white dark:bg-gray-900 py-4 border-t border-gray-200 dark:border-gray-700 z-10">
        <div className="grid grid-cols-4 gap-4 items-center max-w-3xl mx-auto px-6">
          {currentIndex > 0 ? (
            <div className="flex justify-start">
              <button className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition" onClick={onPrev}>
                ← 이전 매물
              </button>
            </div>
          ) : <div />}

          <div className="flex justify-center gap-4 col-span-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition" onClick={() => console.log("계약 등록 이동")}>계약등록</button>
            <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition" onClick={() => navigate(`/broker/myoffice/lstg/mng/edit/${lstgId}`)}>매물수정</button>
            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition" onClick={() => {
              if (confirm("정말 매물을 삭제하시겠습니까?")) {
                axios.post("/lstg/delete", { lstgId })
                  .then(() => {
                    alert("삭제되었습니다");
                    navigate("/broker/myoffice/lstg/mng");
                  })
                  .catch(() => alert("삭제 실패"));
              }
            }}>매물삭제</button>
          </div>

          {currentIndex < totalCount - 1 ? (
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" onClick={onNext}>
                다음 매물 →
              </button>
            </div>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
