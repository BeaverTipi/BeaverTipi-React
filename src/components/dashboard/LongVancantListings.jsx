import { ClockIcon, Calendar } from "lucide-react";
import dayjs from "dayjs";

const dummyVacancyData = [
  { id: "lstg01", name: "성수동 단독주택", postedAt: dayjs().subtract(54, "day").toDate() },
  { id: "lstg02", name: "강남 오피스텔", postedAt: dayjs().subtract(47, "day").toDate() },
  { id: "lstg03", name: "홍대 투룸", postedAt: dayjs().subtract(43, "day").toDate() },
  { id: "lstg04", name: "잠실 원룸", postedAt: dayjs().subtract(41, "day").toDate() },
  { id: "lstg05", name: "건대 오피스텔", postedAt: dayjs().subtract(40, "day").toDate() },
];

export default function LongVacantListings() {
  return (
    <div className="h-full flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center mb-4">
        <ClockIcon className="w-5 h-5 mr-2 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          공실 기간 Top
        </h3>
      </div>

      <div className="flex-1">
        <ol className="text-sm text-gray-700 dark:text-white/80 space-y-3">
          {dummyVacancyData.map((item, index) => {
            const daysVacant = dayjs().diff(dayjs(item.postedAt), "day");
            const postedDate = dayjs(item.postedAt).format("YYYY.MM.DD");
            return (
              <li key={item.id} className="flex flex-col">
                <div className="flex justify-between">
                  <span>
                    <span className="font-semibold mr-2">{index + 1}.</span>
                    {item.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-white/40 whitespace-nowrap">
                    {postedDate} · {daysVacant}일 경과
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
