import { useState } from "react";
import Chart from "react-apexcharts";

const ContractSummaryChart = () => {
  const [filter, setFilter] = useState("이번 주");

  const summaryData = {
    "이번 주": [8, 2, 5],
    "이번 달": [30, 6, 12],
    "올해": [110, 18, 25],
  };

  const series = summaryData[filter];
  const options = {
    chart: { type: "donut" },
    labels: ["성공 계약", "계약 취소", "진행 중"],
    colors: ["#22c55e", "#ef4444", "#eab308"],
    legend: { position: "bottom" },
    dataLabels: {
      formatter: (val, opts) =>
        `${opts.w.config.labels[opts.seriesIndex]}: ${val.toFixed(1)}%`,
    },
  };

  const tabs = ["이번 주", "이번 달", "올해"];

  return (
    <div className="h-full flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-4 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* 상단: 제목 + 탭 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          계약 상태 비율
        </h3>
        <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-full">
          {tabs.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-3 py-1 text-sm rounded-full transition-all 
                ${filter === item
                  ? "bg-white text-blue-600 shadow-sm dark:bg-white/20 dark:text-white"
                  : "text-gray-500 hover:text-blue-600"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* 그래프: flex-grow 시키기 */}
      <div className="flex-1">
        <Chart key={filter} options={options} series={series} type="donut" height="100%" />
      </div>
    </div>
  );
};

export default ContractSummaryChart;
