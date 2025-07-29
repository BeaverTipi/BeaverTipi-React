import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { useSecureAxios } from "../../hooks/useSecureAxios";
import { mapFilterToPeriod } from "./mapFilterToPeriod";

const CommissionTrendMiniChart = () => {
  const [filter, setFilter] = useState("이번 달");
  const [chartData, setChartData] = useState({
    categories: [],
    series: [],
  });

  const secureAxios = useSecureAxios();

  useEffect(() => {
    const period = mapFilterToPeriod(filter);
    secureAxios.post("/dashboard/commission-trend", { period }).then((res) => {
      if (!res) return;
      const { categories, totals } = res;
      setChartData({
        categories: Array.isArray(categories) ? categories : [],
        series: Array.isArray(totals) ? totals : [],
      });
    });
  }, [filter]);

  const { categories, series } = chartData;

  const chartOptions = {
    chart: { type: "bar", height: 180, toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#60a5fa"],
    plotOptions: { bar: { columnWidth: "50%", borderRadius: 4 } },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "12px" } },
    },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val) => `${val.toLocaleString()}원` } },
    grid: { yaxis: { lines: { show: false } } },
  };

  const tabOptions = ["이번 주", "이번 달", "이번 분기", "올해"];

  return (
    <div className="overflow-hidden rounded-2xl border bg-white px-5 py-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">수수료 추이</h3>
        <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-full">
          {tabOptions.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-3 py-1 text-sm rounded-full transition-all ${
                filter === item ? "bg-white text-blue-600 shadow-sm dark:bg-white/20 dark:text-white" : "text-gray-500 hover:text-blue-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <Chart
        key={filter}
        options={chartOptions}
        series={[{ name: "수수료", data: series }]}
        type="bar"
        height={180}
      />
    </div>
  );
};

export default CommissionTrendMiniChart;
