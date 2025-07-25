import { useState } from "react";
import Chart from "react-apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";

const ContractSummaryChart = () => {
  const [filter, setFilter] = useState("이번 주");
  const [isOpen, setIsOpen] = useState(false);

  // 샘플 데이터 (실제 API 연동 시 filter에 따라 갱신)
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

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-2 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          계약 상태 비율
        </h3>
        <div className="relative inline-block">
          <button onClick={() => setIsOpen(!isOpen)}>
            <MoreDotIcon className="size-6 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-32 p-2">
            {["이번 주", "이번 달", "올해"].map((item) => (
              <DropdownItem
                key={item}
                onItemClick={() => {
                  setFilter(item);
                  setIsOpen(false);
                }}
              >
                {item}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>

      <Chart options={options} series={series} type="donut" height={250} />
    </div>
  );
};

export default ContractSummaryChart;
