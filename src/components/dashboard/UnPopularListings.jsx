import { Link } from "react-router";
import { EyeOff, Eye, Info, Clock3, BadgeDollarSignIcon } from "lucide-react";
import dayjs from "dayjs";

export default function UnpopularListings({ listings = [] }) {
const formatPrice = (item) => {
  if (item.LSTG_TYPE_SALE === "002") {
    return `${item.LSTG_LEASE_AMT?.toLocaleString() ?? "-"} / ${item.LSTG_LEASE_M?.toLocaleString() ?? "-"} 만원`;
  }
  if (item.LSTG_TYPE_SALE === "001") {
    return `${item.LSTG_LEASE_AMT?.toLocaleString() ?? "-"} 만원`;
  }
  if (item.LSTG_TYPE_SALE === "003") {
    return `${item.LSTG_LEASE_AMT?.toLocaleString() ?? "-"} 만원`;
  }
  return "-";
};


const getTypeLabel = (code) => {
  switch (code) {
    case "001":
      return "전세";
    case "002":
      return "월세";
    case "003":
      return "매매";
    default:
      return "정보없음";
  }
};

  return (
    <div className="h-full flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center mb-4 relative">
        <EyeOff className="w-5 h-5 mr-2 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mr-1">
          최근 반응 적은 매물
        </h3>
        <div className="group relative">
          <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-pointer" />
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-max max-w-xs px-3 py-2 text-xs text-white bg-black rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            최근 2주간 조회수가 가장 낮은 매물 순위입니다.
          </div>
        </div>
      </div>

      <div className="flex-1">
        <ul className="space-y-3">
          {listings.map((listing, index) => (
            <li
              key={listing.LSTG_ID}
              className="flex justify-between items-start bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 p-3 rounded-lg transition"
            >
              <div className="flex flex-col space-y-1 w-2/3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-400">{index + 1}.</span>
                  <Link
                    to={`/listings/${listing.LSTG_ID}`}
                    className="text-sm font-medium text-gray-800 dark:text-white/90 hover:underline"
                  >
                    {listing.LSTG_NM}
                  </Link>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-2 pl-5">
                  <span className="flex items-center">
                    <BadgeDollarSignIcon className="w-3.5 h-3.5 mr-1" />
                    {getTypeLabel(listing.LSTG_TYPE_SALE)} | {formatPrice(listing)}
                  </span>
                  <span className="flex items-center">
                    <Clock3 className="w-3.5 h-3.5 mr-1" />
                    {dayjs(listing.LSTG_REG_DATE).format("MM.DD")} 등록
                  </span>
                </div>
              </div>

              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap mt-1">
                <Eye className="w-4 h-4 mr-1" />
                {listing.VIEW_COUNT?.toLocaleString() ?? 0}회
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
