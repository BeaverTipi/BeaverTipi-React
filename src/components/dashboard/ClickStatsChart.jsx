import { useState } from "react";
import Chart from "react-apexcharts";

const ClickStatsChart = () => {
  const [filter, setFilter] = useState("이번 달");

  const chartData = {
    당일: {
      categories: ["강남 오피스텔", "마포 투룸", "서초 전세"],
      views: [122, 88, 95],
      inquiries: [6, 2, 4],
    },
    "이번 달": {
      categories: ["강남 오피스텔", "마포 투룸", "서초 전세", "한남동 원룸", "노원 오피스텔", "분당 상가"],
      views: [532, 480, 610, 442, 390, 505],
      inquiries: [23, 12, 30, 19, 8, 16],
    },
    "지난 달": {
      categories: ["강남 오피스텔", "마포 투룸", "서초 전세", "한남동 원룸", "노원 오피스텔", "분당 상가"],
      views: [480, 455, 588, 420, 360, 490],
      inquiries: [18, 9, 28, 16, 6, 12],
    },
    "올해 누적": {
      categories: ["강남 오피스텔", "마포 투룸", "서초 전세", "한남동 원룸", "노원 오피스텔", "분당 상가"],
      views: [6230, 5540, 6900, 5821, 4910, 6112],
      inquiries: [220, 140, 310, 190, 80, 160],
    },
  };

  const { categories, views, inquiries } = chartData[filter];

  const options = {
    colors: ["#3b82f6", "#f97316"],
    chart: {
      type: "bar",
      height: 200,
      toolbar: { show: false },
      fontFamily: "inherit",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 6,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: (val) => `${val}회`,
      },
    },
  };

  const series = [
    { name: "조회수", data: views },
    { name: "문의수", data: inquiries },
  ];

  const tabOptions = ["당일", "이번 달", "지난 달", "올해 누적"];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-3 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          매물별 조회수 / 문의수
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

      <div className="custom-scrollbar -ml-5 min-w-[650px] xl:min-w-full pl-2">
        <Chart options={options} series={series} type="bar" height={200} />
      </div>
    </div>
  );
};

export default ClickStatsChart;
