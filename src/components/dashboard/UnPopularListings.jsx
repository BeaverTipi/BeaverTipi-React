import { useEffect, useState } from "react";
import { Link } from "react-router";
import { EyeOff, Eye, Info } from "lucide-react"; // EyeOff 아이콘으로 교체

const UnpopularListings = () => {
  const [unpopular, setUnpopular] = useState([]);

  useEffect(() => {
    // 관심 없는 매물 (조회수 적은 순)
    const dummy = [
      { id: "L101", title: "관악구 고시원", viewCount: 3 },
      { id: "L102", title: "상계동 반지하 원룸", viewCount: 7 },
      { id: "L103", title: "금천구 창고", viewCount: 9 },
      { id: "L104", title: "구로동 전세 상가", viewCount: 12 },
      { id: "L105", title: "봉천동 셰어하우스", viewCount: 14 },
    ];
    setUnpopular(dummy);
  }, []);

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
              className="flex items-center justify-between bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 p-3 rounded-lg transition"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-400">{index + 1}.</span>
                <Link
                  to={`/listings/${listing.id}`}
                  className="text-sm text-gray-800 dark:text-white/90 hover:underline"
                >
                  {listing.title}
                </Link>
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
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
