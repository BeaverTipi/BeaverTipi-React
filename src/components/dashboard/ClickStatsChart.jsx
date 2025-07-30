import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { useSecureAxios } from "../../hooks/useSecureAxios";
import { mapFilterToPeriod } from "./mapFilterToPeriod";

const ClickStatsChart = () => {
  const [filter, setFilter] = useState("이번 달");
  const [chartData, setChartData] = useState({
    categories: [],
    views: [],
    inquiries: [],
  });

  const secureAxios = useSecureAxios();

  useEffect(() => {
    const period = mapFilterToPeriod(filter);
    secureAxios.post("/dashboard/listing-stats", { period }).then((res) => {
      if (!res) return;
      const { categories, viewStats, inquiryStats } = res;
      setChartData({
        categories: Array.isArray(categories) ? categories : [],
        views: Array.isArray(viewStats) ? viewStats : [],
        inquiries: Array.isArray(inquiryStats) ? inquiryStats : [],
      });
    });
  }, [filter]);

  const { categories, views, inquiries } = chartData;

  const options = {
    colors: ["#3b82f6", "#f97316"],
    chart: { type: "bar", height: 200, toolbar: { show: false }, fontFamily: "inherit" },
    plotOptions: { bar: { horizontal: false, columnWidth: "40%", borderRadius: 6 } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: { show: true, position: "top", horizontalAlign: "left" },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val) => `${val}회` } },
  };

  const series = [
    { name: "조회수", data: views },
    { name: "문의수", data: inquiries },
  ];
const tabOptions = ["오늘", "이번 주", "이번 달", "이번 분기" , "올해"];



  return (
    <div className="overflow-hidden rounded-2xl border bg-white px-5 pt-5 pb-3 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">매물별 조회수 / 문의수</h3>
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
      <div className="custom-scrollbar -ml-5 min-w-[650px] xl:min-w-full pl-2">
        <Chart options={options} series={series} type="bar" height={300} />
      </div>
    </div>
  );
};

export default ClickStatsChart;
