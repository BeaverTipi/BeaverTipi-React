import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { useSecureAxios } from "../../hooks/useSecureAxios";
import { mapFilterToPeriod } from "./mapFilterToPeriod";

const ContractSummaryChart = () => {
  const [filter, setFilter] = useState("이번 주");
  const [series, setSeries] = useState([0, 0, 0]);
  const secureAxios = useSecureAxios();

  const tabOptions = ["이번 주", "이번 달", "이번 분기", "올해"];

  useEffect(() => {
    const period = mapFilterToPeriod(filter);
    secureAxios.post("/dashboard/contract-summary", { period }).then((res) => {
      if (!res || typeof res.series !== "object") return;

      const success = res.series.success || 0;
      const cancel = res.series.cancel || 0;
      const pending = res.series.pending || 0;
      const total = res.series.total || 0;

      if (total === 0) {
        setSeries([0, 0, 0]);
      } else {
        const successRatio = (success / total) * 100;
        const cancelRatio = (cancel / total) * 100;
        const pendingRatio = (pending / total) * 100;
        setSeries([successRatio, cancelRatio, pendingRatio]);
      }
    });
  }, [filter]);

  const options = {
    chart: { type: "donut" },
    labels: ["성공 계약", "계약 취소", "진행 중"],
    colors: ["#22c55e", "#ef4444", "#eab308"],
    legend: { position: "bottom" },
    dataLabels: {
      formatter: (val, opts) =>
        `${opts.w.config.labels[opts.seriesIndex]}: ${val.toFixed(1)}%`,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toFixed(1)}%`,
      },
    },
  };

  return (
    <div className="h-full flex flex-col overflow-hidden rounded-2xl border bg-white px-5 pt-5 pb-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">계약 상태 비율</h3>
        <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-full">
          {tabOptions.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-3 py-1 text-sm rounded-full transition-all ${
                filter === item
                  ? "bg-white text-blue-600 shadow-sm dark:bg-white/20 dark:text-white"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <Chart key={filter} options={options} series={series} type="donut" height="100%" />
      </div>
    </div>
  );
};

export default ContractSummaryChart;
