import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ClockIcon } from "lucide-react";
import dayjs from "dayjs";

const NewListings = () => {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    // ✅ 예시 데이터 (추후 API 연동)
    const dummy = [
      {
        id: "L001",
        title: "강남역 오피스텔",
        createdAt: "2025-07-25T09:30:00",
      },
      {
        id: "L002",
        title: "마포구 신축 원룸",
        createdAt: "2025-07-24T16:10:00",
      },
      {
        id: "L003",
        title: "송파구 투룸 전세",
        createdAt: "2025-07-24T08:50:00",
      },
      {
        id: "L004",
        title: "서초동 월세 아파트",
        createdAt: "2025-07-23T15:20:00",
      },
      {
        id: "L005",
        title: "용산구 단독주택",
        createdAt: "2025-07-23T11:40:00",
      },
    ];
    setListings(dummy);
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        신규 매물 등록
      </h3>
      <ul className="space-y-3">
        {listings.map((listing) => (
          <li
            key={listing.id}
            className="flex items-start justify-between rounded-lg bg-white hover:bg-gray-50 dark:bg-transparent dark:hover:bg-white/5 p-3 transition"
          >
            <div>
              <h4 className="font-medium text-sm text-gray-800 dark:text-white/90">
                <Link to={`/listings/${listing.id}`} className="hover:underline">
                  {listing.title}
                </Link>
              </h4>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                <ClockIcon className="w-3.5 h-3.5 mr-1" />

                {dayjs(listing.createdAt).format("YYYY.MM.DD HH:mm")}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewListings;
