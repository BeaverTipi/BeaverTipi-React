import { useEffect, useState } from "react";
import { useSecureAxios } from "../../hooks/useSecureAxios";
import PageMeta from "../../components/common/PageMeta";
import CommissionTotal from "../../components/dashboard/CommissionTotal";
import WeeklySchedule from "../../components/dashboard/WeeklySchedule";
import ContractSummaryChart from "../../components/dashboard/ContractSummary";
import ContractTrendChart from "../../components/dashboard/ContractTrendChart";
import NewListings from "../../components/dashboard/NewListings";
import UnPopularListings from "../../components/dashboard/UnPopularListings";
import LongVacantListings from "../../components/dashboard/LongVancantListings";
import ClickStatsChart from "../../components/dashboard/ClickStatsChart";

export default function Home() {
  const secureAxios = useSecureAxios();
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    secureAxios.post("/dashboard/overview", {}).then((res) => {
      console.log(res);
      setOverview(res);
    })
    .catch((err) => {
      console.error("Dashboard overview fetch error:", err);
    });
  }, [secureAxios]);

  if (!overview)
    return <div className="p-5 text-sm text-gray-500">로딩 중...</div>;

  return (
    <>
      <PageMeta
        title="BeaverTipi | myoffice"
        description="매물/계약/수수료 통계와 최신 활동을 확인하세요."
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6 items-stretch">
        <div className="col-span-12 xl:col-span-4">
          <CommissionTotal  total={overview.commissionTotal}  />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <WeeklySchedule  schedules={overview.weeklySchedule}  />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <ContractSummaryChart  summary={overview.contractStatusSummary}  
          />
        </div>

        <div className="col-span-12">
          <ContractTrendChart trend={overview.contractTrend}  />
        </div>

        <div className="col-span-12">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-full">
            <NewListings  listings={overview.newListings}  />
            <UnPopularListings  listings={overview.unpopularListings}  />
            <LongVacantListings  listings={overview.longVacantListings}  />
          </div>
        </div>

        <div className="col-span-12">
          <ClickStatsChart  stats={overview.listingStats}   />
        </div>
      </div>
    </>
  );
}
