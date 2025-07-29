import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { useSecureAxios } from "../../hooks/useSecureAxios";
import { mapFilterToPeriod } from "./mapFilterToPeriod";

const ContractTrendChart = () => {
  const [filter, setFilter] = useState("이번 달");
  const [chartData, setChartData] = useState({
    categories: [],
    success: [],
    cancel: [],
    pending: [],
  });

  const secureAxios = useSecureAxios();

useEffect(() => {
  const period = mapFilterToPeriod(filter);
  secureAxios.post("/dashboard/contract-trend", { period }).then((res) => {
    if (!res || !Array.isArray(res.series) || !Array.isArray(res.labels)) return;

    const categories = res.labels;

    const successSeries = res.series.find((s) => s.name === "success")?.data || [];
    const cancelSeries = res.series.find((s) => s.name === "cancel")?.data || [];
    const pendingSeries = res.series.find((s) => s.name === "pending")?.data || [];

    setChartData({
      categories,
      success: successSeries,
      cancel: cancelSeries,
      pending: pendingSeries,
    });
  });
}, [filter]);


  const { categories, success, cancel, pending } = chartData;

  const options = {
    chart: { type: "line", height: 280, fontFamily: "inherit", toolbar: { show: false } },
    colors: ["#22c55e", "#ef4444", "#eab308"],
    stroke: { curve: "smooth", width: 3 },
    xaxis: { categories },
    legend: { position: "top", horizontalAlign: "left" },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val) => `${val}건` } },
  };

  const series = [
    { name: "성공", data: success },
    { name: "취소", data: cancel },
    { name: "진행 중", data: pending },
  ];

  const tabOptions = ["이번 주", "이번 달", "이번 분기", "올해"];


  return (
    <div className="overflow-hidden rounded-2xl border bg-white px-5 pt-5 pb-3 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">계약 성사 추이</h3>
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full">
          {tabOptions.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                filter === item ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-blue-600"
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
