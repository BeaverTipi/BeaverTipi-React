import { useState } from "react";
import CommissionTrendMiniChart from "./CommisionTrendMiniChart";

const CommissionTotal = () => {
  const [filter, setFilter] = useState("이번 주");

  const commissionData = {
    "이번 주": 1380000,
    "이번 달": 5830000,
    "올해": 42500000,
  };

  const currentCommission = commissionData[filter];
  const tabOptions = ["이번 주", "이번 달", "올해"];

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-white/[0.03]">
        {/* 헤더 영역 */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            수수료 합계
          </h3>
          <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-full">
            {tabOptions.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-3 py-1 text-xs rounded-full transition-all 
                  ${filter === item
                    ? "bg-white text-blue-600 shadow-sm dark:bg-white/20 dark:text-white"
                    : "text-gray-500 hover:text-blue-600"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 수치 영역 */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {currentCommission.toLocaleString()}원
          </div>
          <p className="text-sm text-gray-400 mt-1">{filter} 기준</p>
        </div>
      </div>

      {/* 미니 차트 - 카드 외부 */}
      <div className="mt-3">
        <CommissionTrendMiniChart filter={filter} />
      </div>
    </>
  );
};

export default CommissionTotal;
