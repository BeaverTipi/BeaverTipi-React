import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { MoreDotIcon } from "../../icons";

const CommissionTotal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("이번 달");

  // 예시 데이터 (실제 데이터는 API 연동 가능)
  const commissionData = {
    "이번 주": 1380000,
    "이번 달": 5830000,
    "올해": 42500000,
  };

  const currentCommission = commissionData[filter];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          수수료 합계
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

      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
        {currentCommission.toLocaleString()}원
      </div>
    </div>
  );
};

export default CommissionTotal;
