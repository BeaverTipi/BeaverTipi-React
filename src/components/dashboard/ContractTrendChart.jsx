import { useState } from "react";
import Chart from "react-apexcharts";

const ContractTrendChart = () => {
  const [filter, setFilter] = useState("이번 달");

  const chartData = {
    "이번 주": {
      categories: ["월", "화", "수", "목", "금", "토", "일"],
      success: [2, 1, 3, 2, 0, 1, 1],
      cancel: [0, 1, 0, 0, 1, 0, 0],
      pending: [1, 0, 2, 1, 0, 0, 1],
    },
    "이번 달": {
      categories: Array.from({ length: 4 }, (_, i) => `${i + 1}주차`),
      success: [8, 6, 10, 7],
      cancel: [2, 1, 3, 1],
      pending: [4, 5, 3, 2],
    },
    "올해": {
      categories: ["1월", "2월", "3월", "4월", "5월", "6월"],
      success: [10, 15, 12, 17, 20, 18],
      cancel: [2, 1, 3, 2, 1, 2],
      pending: [3, 4, 2, 3, 2, 1],
    },
  };

  const { categories, success, cancel, pending } = chartData[filter];

  const options = {
    chart: {
      type: "line",
      height: 280,
      fontFamily: "inherit",
      toolbar: { show: false },
    },
    colors: ["#22c55e", "#ef4444", "#eab308"],
    stroke: { curve: "smooth", width: 3 },
    xaxis: { categories },
    legend: { position: "top", horizontalAlign: "left" },
    dataLabels: { enabled: false },
    tooltip: {
      y: {
        formatter: (val) => `${val}건`,
      },
    },
  };

  const series = [
    { name: "성공", data: success },
    { name: "취소", data: cancel },
    { name: "진행 중", data: pending },
  ];

  const tabOptions = ["이번 주", "이번 달", "올해"];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-3 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          계약 성사 추이
        </h3>
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full">
          {tabOptions.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                filter === item
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <Chart options={options} series={series} type="line" height={280} />
    </div>
  );
};

export default ContractTrendChart;
