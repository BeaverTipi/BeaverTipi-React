import { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router";

const WeeklySchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const dummy = [
      { id: "scd01", title: "세입자 미팅", date: dayjs().add(1, "day").toDate() },
      { id: "scd02", title: "계약서 작성", date: dayjs().add(2, "day").toDate() },
      { id: "scd03", title: "현장 방문", date: dayjs().add(4, "day").toDate() },
      { id: "scd04", title: "Sibal", date: dayjs().add(4, "day").toDate() },
      { id: "scd05", title: "Go Home", date: dayjs().add(4, "day").toDate() },
      { id: "scd07", title: "Go My Home", date: dayjs().add(4, "day").toDate() },
    ];
    setSchedules(dummy);
  }, []);

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-4 dark:border-gray-800 dark:bg-white/[0.03] flex flex-col justify-between">
      {/* 헤더 */}
      <div className="flex items-center mb-4">
        <CalendarIcon className="w-5 h-5 mr-2 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          이번 주 일정
        </h3>
      </div>

      {/* 일정 리스트 */}
      <div className="flex-1">
        <ul className="space-y-3">
          {schedules.slice(0, 4).map((item) => (
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

      {/* 더보기 버튼 */}
      {schedules.length > 4 && (
        <div className="mt-3 text-right">
          <button
            onClick={() => navigate("/myoffice/schedule")}
            className="text-sm text-blue-600 hover:underline"
          >
            + 더보기
          </button>
        </div>
      )}
    </div>
  );
};

export default WeeklySchedule;
