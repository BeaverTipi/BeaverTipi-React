import PageMeta from "../../components/common/PageMeta";
import ClickStatsChart from "../../components/dashboard/ClickStatsChart";
import CommissionTotal from "../../components/dashboard/CommissionTotal";
import ContractSummaryChart from "../../components/dashboard/ContractSummary";
import ContractTrendChart from "../../components/dashboard/ContractTrendChart";
import LongVacantListings from "../../components/dashboard/LongVancantListings";
import NewListings from "../../components/dashboard/NewListings";
import UnPopularListings from "../../components/dashboard/UnPopularListings";
import WeeklySchedule from "../../components/dashboard/WeeklySchedule";

export default function Home() {
  return (
    <>
      <PageMeta
        title="BeaverTipi | myoffice"
        description="매물/계약/수수료 통계와 최신 활동을 확인하세요."
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6 items-stretch">
        {/* ✅ 1행: 수수료 합계+추이 / 일정 / 계약 상태 비율 */}
        <div className="col-span-12 xl:col-span-4">
          <CommissionTotal />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <WeeklySchedule />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <ContractSummaryChart />
        </div>

        {/* ✅ 2행: 계약 성사 추이 */}
        <div className="col-span-12">
          <ContractTrendChart />
        </div>

        {/* ✅ 3행: 신규 / 관심없는 / 공실 */}
        <div className="col-span-12">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-full">
            <div className="h-full">
              <NewListings />
            </div>
            <div className="h-full">
              <UnPopularListings />
            </div>
            <div className="h-full">
              <LongVacantListings />
            </div>
          </div>
        </div>

        {/* ✅ 4행: 조회수/문의수 */}
        <div className="col-span-12">
          <ClickStatsChart />
        </div>
      </div>
    </>
  );
}
