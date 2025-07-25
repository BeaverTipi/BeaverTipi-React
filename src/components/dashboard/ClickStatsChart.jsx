import { useState } from "react";
import Chart from "react-apexcharts";
import { MoreDotIcon } from "../../icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";

const ClickStatsChart = () => {
  const options = {
    colors: ["#3b82f6", "#f59e0b"], // 조회수(파랑), 클릭수(노랑)
    chart: {
      type: "bar",
      height: 180,
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
      categories: ["1월", "2월", "3월", "4월", "5월", "6월"],
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
    {
      name: "조회수",
      data: [320, 412, 390, 298, 380, 420],
    },
    {
      name: "클릭수",
      data: [112, 210, 150, 198, 222, 275],
    },
  ];

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          조회수 / 클릭수
        </h3>
        <div className="relative inline-block">
          <button onClick={() => setIsOpen(!isOpen)}>
            <MoreDotIcon className="size-6 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
            <DropdownItem onItemClick={() => setIsOpen(false)}>이번 달</DropdownItem>
            <DropdownItem onItemClick={() => setIsOpen(false)}>지난 달</DropdownItem>
            <DropdownItem onItemClick={() => setIsOpen(false)}>올해 누적</DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="custom-scrollbar -ml-5 min-w-[650px] xl:min-w-full pl-2">
        <Chart options={options} series={series} type="bar" height={180} />
      </div>
    </div>
  );
};

export default ClickStatsChart;
