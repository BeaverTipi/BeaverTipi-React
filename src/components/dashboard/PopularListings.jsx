import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Eye, Sparkles } from "lucide-react"; // ✅ lucide 아이콘 사용

const PopularListings = () => {
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    const dummy = [
      { id: "L021", title: "역삼동 대형 오피스텔", viewCount: 532 },
      { id: "L011", title: "연남동 신축 투룸", viewCount: 482 },
      { id: "L015", title: "가락시장역 전세 아파트", viewCount: 455 },
    ];
    setPopular(dummy);
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center mb-4">
        <Sparkles className="w-5 h-5 mr-2 text-orange-500" /> {/* lucide icon */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          인기 매물 Top 3
        </h3>
      </div>

      <ul className="space-y-3">
        {popular.map((listing, index) => (
          <li
            key={listing.id}
            className="flex items-center justify-between bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 p-3 rounded-lg transition"
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-blue-500">{index + 1}.</span>
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
  );
};

export default PopularListings;
