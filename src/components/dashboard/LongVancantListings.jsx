import {
  ClockIcon,
  BadgeDollarSignIcon,
  MapPinIcon,
  FlameIcon,
} from "lucide-react";
import dayjs from "dayjs";

const dummyVacancyData = [
  {
    id: "lstg01",
    name: "성수동 단독주택",
    postedAt: dayjs().subtract(54, "day").toDate(),
    area: "성동구",
    type: "전세",
    deposit: 40000,
  },
  {
    id: "lstg02",
    name: "강남 오피스텔",
    postedAt: dayjs().subtract(47, "day").toDate(),
    area: "강남구",
    type: "월세",
    deposit: 2000,
    monthly: 100,
  },
  {
    id: "lstg03",
    name: "홍대 투룸",
    postedAt: dayjs().subtract(43, "day").toDate(),
    area: "마포구",
    type: "월세",
    deposit: 1000,
    monthly: 80,
  },
  {
    id: "lstg04",
    name: "잠실 원룸",
    postedAt: dayjs().subtract(41, "day").toDate(),
    area: "송파구",
    type: "전세",
    deposit: 16000,
  },
  {
    id: "lstg05",
    name: "건대 오피스텔",
    postedAt: dayjs().subtract(40, "day").toDate(),
    area: "광진구",
    type: "매매",
    price: 89000,
  },
];

export default function LongVacantListings() {
  const formatPrice = (item) => {
    if (item.type === "월세") return `${item.deposit} / ${item.monthly} 만원`;
    if (item.type === "전세") return `${item.deposit} 만원`;
    if (item.type === "매매") return `${item.price} 만원`;
    return "-";
  };

  const getSeverityColor = (days) => {
    if (days >= 50) return "text-red-600";
    if (days >= 40) return "text-yellow-600";
    return "text-gray-500";
  };

  const getSeverityIcon = (days) => {
    if (days >= 50)
      return (
        <FlameIcon className="w-3.5 h-3.5 mr-1 text-red-500 shrink-0 self-center" />
      );
    if (days >= 40)
      return (
        <FlameIcon className="w-3.5 h-3.5 mr-1 text-yellow-500 shrink-0 self-center" />
      );
    return null;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center mb-4">
        <ClockIcon className="w-5 h-5 mr-2 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1 mr-1">
          공실 기간 Top
        </h3>
      </div>

      <div className="flex-1">
        <ul className="space-y-4">
          {dummyVacancyData.map((item, index) => {
            const daysVacant = dayjs().diff(dayjs(item.postedAt), "day");
            const postedDate = dayjs(item.postedAt).format("YYYY.MM.DD");

            return (
              <li key={item.id} className="flex flex-col min-h-[4rem]">
                {/* 제목 줄 */}
                <h4 className="text-sm font-medium leading-[1.25rem] text-gray-800 dark:text-white/90">
                  <span className="text-gray-400 mr-2 font-semibold">
                    {index + 1}.
                  </span>
                  {item.name}
                </h4>

                {/* 상세 줄 */}
                <div className="mt-1 text-xs leading-[1rem] text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-3 gap-y-1">
                  <span className="flex items-center">
                    <MapPinIcon className="w-3.5 h-3.5 mr-1 shrink-0 self-center" />
                    {item.area}
                  </span>
                  <span className="flex items-center">
                    <BadgeDollarSignIcon className="w-3.5 h-3.5 mr-1 shrink-0 self-center" />
                    {item.type} | {formatPrice(item)}
                  </span>
                  <span
                    className={`flex items-center font-medium ${getSeverityColor(
                      daysVacant
                    )}`}
                  >
                    {getSeverityIcon(daysVacant)}
                    {postedDate} · {daysVacant}일 경과
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
