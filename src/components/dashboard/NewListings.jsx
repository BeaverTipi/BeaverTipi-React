import { Link } from "react-router";
import { ClockIcon, MapPinIcon, BadgeDollarSignIcon } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default function NewListings({ listings = [] }) {
  const formatType = (code) => {
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

const formatPrice = (item) => {
  const toManwon = (value) =>
    value && !isNaN(value) ? (value / 10000).toLocaleString() : "-";

  if (item.LSTG_TYPE_SALE === "002") {
    return `${toManwon(item.LSTG_LEASE_M)} 만원 / ${toManwon(item.LSTG_LEASE_AMT)} 만원 `;
  }
  if (item.LSTG_TYPE_SALE === "001" || item.LSTG_TYPE_SALE === "003") {
    return `${toManwon(item.LSTG_LEASE)} 만원`;
  }
  return "-";
};


  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        신규 매물 등록
      </h3>
      <ul className="space-y-4">
        {listings.slice(0, 5).map((item) => (
          <li
            key={item.LSTG_ID}
            className="flex items-start justify-between rounded-lg bg-white hover:bg-gray-50 dark:bg-transparent dark:hover:bg-white/5 p-3 transition"
          >
            <div className="flex-1">
              <h4 className="font-medium text-sm text-gray-800 dark:text-white/90">
                <Link to={`/listings/${item.LSTG_ID}`} className="hover:underline">
                  {item.LSTG_NM}
                </Link>
              </h4>

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                <span className="flex items-center">
                  <MapPinIcon className="w-3.5 h-3.5 mr-1" />
                  {item.LSTG_ADD}
                </span>
                <span className="flex items-center">
                  <BadgeDollarSignIcon className="w-3.5 h-3.5 mr-1" />
                  {formatType(item.LSTG_TYPE_SALE)} | {formatPrice(item)}
                </span>
                <span className="flex items-center">
                  <ClockIcon className="w-3.5 h-3.5 mr-1" />
                  {dayjs(item.LSTG_REG_DATE).fromNow()} (
                  {dayjs(item.LSTG_REG_DATE).format("YYYY.MM.DD HH:mm")})
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
