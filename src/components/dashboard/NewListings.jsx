import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ClockIcon, MapPinIcon, HomeIcon, BadgeDollarSignIcon } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const NewListings = () => {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    // ✅ 예시 데이터 (썸네일 제외)
    const dummy = [
      {
        id: "L001",
        title: "강남역 오피스텔",
        createdAt: "2025-07-25T09:30:00",
        type: "월세",
        deposit: 1500,
        monthly: 70,
        area: "강남구",
      },
      {
        id: "L002",
        title: "마포구 신축 원룸",
        createdAt: "2025-07-24T16:10:00",
        type: "전세",
        deposit: 22000,
        area: "마포구",
      },
      {
        id: "L003",
        title: "송파구 투룸 전세",
        createdAt: "2025-07-24T08:50:00",
        type: "전세",
        deposit: 30000,
        area: "송파구",
      },
      {
        id: "L004",
        title: "서초동 월세 아파트",
        createdAt: "2025-07-23T15:20:00",
        type: "월세",
        deposit: 1000,
        monthly: 60,
        area: "서초구",
      },
      {
        id: "L005",
        title: "용산구 단독주택",
        createdAt: "2025-07-23T11:40:00",
        type: "매매",
        price: 95000,
        area: "용산구",
      },
    ];
    setListings(dummy);
  }, []);

  const formatPrice = (item) => {
    if (item.type === "월세") return `${item.deposit} / ${item.monthly} 만원`;
    if (item.type === "전세") return `${item.deposit} 만원`;
    if (item.type === "매매") return `${item.price} 만원`;
    return "-";
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        신규 매물 등록
      </h3>
      <ul className="space-y-4">
        {listings.map((listing) => (
          <li
            key={listing.id}
            className="flex items-start justify-between rounded-lg bg-white hover:bg-gray-50 dark:bg-transparent dark:hover:bg-white/5 p-3 transition"
          >
            <div className="flex-1">
              <h4 className="font-medium text-sm text-gray-800 dark:text-white/90">
                <Link to={`/listings/${listing.id}`} className="hover:underline">
                  {listing.title}
                </Link>
              </h4>

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                <span className="flex items-center">
                  <MapPinIcon className="w-3.5 h-3.5 mr-1" />
                  {listing.area}
                </span>
                <span className="flex items-center">
                  <BadgeDollarSignIcon className="w-3.5 h-3.5 mr-1" />
                  {listing.type} | {formatPrice(listing)}
                </span>
                <span className="flex items-center">
                  <ClockIcon className="w-3.5 h-3.5 mr-1" />
                  {dayjs(listing.createdAt).fromNow()} (
                  {dayjs(listing.createdAt).format("YYYY.MM.DD HH:mm")})
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewListings;
