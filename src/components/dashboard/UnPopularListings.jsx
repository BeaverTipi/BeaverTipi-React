import { useEffect, useState } from "react";
import { Link } from "react-router";
import { EyeOff, Eye, Info, Clock3, BadgeDollarSignIcon } from "lucide-react";
import dayjs from "dayjs";

const UnpopularListings = () => {
  const [unpopular, setUnpopular] = useState([]);

  useEffect(() => {
    const dummy = [
      {
        id: "L101",
        title: "관악구 고시원",
        viewCount: 3,
        area: "관악구",
        type: "월세",
        deposit: 300,
        monthly: 25,
        createdAt: "2025-07-15T11:10:00",
      },
      {
        id: "L102",
        title: "상계동 반지하 원룸",
        viewCount: 7,
        area: "상계동",
        type: "전세",
        deposit: 8500,
        createdAt: "2025-07-14T16:20:00",
      },
      {
        id: "L103",
        title: "금천구 창고",
        viewCount: 9,
        area: "금천구",
        type: "월세",
        deposit: 500,
        monthly: 50,
        createdAt: "2025-07-13T09:00:00",
      },
      {
        id: "L104",
        title: "구로동 전세 상가",
        viewCount: 12,
        area: "구로동",
        type: "전세",
        deposit: 35000,
        createdAt: "2025-07-11T10:10:00",
      },
      {
        id: "L105",
        title: "봉천동 셰어하우스",
        viewCount: 14,
        area: "봉천동",
        type: "월세",
        deposit: 200,
        monthly: 20,
        createdAt: "2025-07-10T14:00:00",
      },
    ];
    setUnpopular(dummy);
  }, []);

  const formatPrice = (item) => {
    if (item.type === "월세") return `${item.deposit} / ${item.monthly} 만원`;
    if (item.type === "전세") return `${item.deposit} 만원`;
    return "-";
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
          {unpopular.map((listing, index) => (
            <li
              key={listing.id}
              className="flex justify-between items-start bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 p-3 rounded-lg transition"
            >
              <div className="flex flex-col space-y-1 w-2/3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-400">{index + 1}.</span>
                  <Link
                    to={`/listings/${listing.id}`}
                    className="text-sm font-medium text-gray-800 dark:text-white/90 hover:underline"
                  >
                    {listing.title}
                  </Link>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-2 pl-5">
                  <span className="flex items-center">
                    <BadgeDollarSignIcon className="w-3.5 h-3.5 mr-1" />
                    {listing.type} | {formatPrice(listing)}
                  </span>
                  <span className="flex items-center">
                    <Clock3 className="w-3.5 h-3.5 mr-1" />
                    {dayjs(listing.createdAt).format("MM.DD")} 등록
                  </span>
                </div>
              </div>

              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap mt-1">
                <Eye className="w-4 h-4 mr-1" />
                {listing.viewCount.toLocaleString()}회
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UnpopularListings;
