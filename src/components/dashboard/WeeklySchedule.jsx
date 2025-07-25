import { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";
import dayjs from "dayjs";

const WeeklySchedule = () => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    // 더미 일정 데이터
    const dummy = [
      {
        id: "scd01",
        title: "세입자 미팅",
        date: dayjs().add(1, "day").toDate(),
      },
      {
        id: "scd02",
        title: "계약서 작성",
        date: dayjs().add(2, "day").toDate(),
      },
      {
        id: "scd03",
        title: "현장 방문",
        date: dayjs().add(4, "day").toDate(),
      },
    ];
    setSchedules(dummy);
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center mb-4">
        <CalendarIcon className="w-5 h-5 mr-2 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          이번 주 일정
        </h3>
      </div>

      <ul className="space-y-3">
        {schedules.map((item) => (
          <li
            key={item.id}
            className="flex justify-between items-center p-3 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                {item.title}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {dayjs(item.date).format("YYYY-MM-DD dddd")}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WeeklySchedule;
