import PageMeta from "../../components/common/PageMeta";
import ClickStatsChart from "../../components/dashboard/ClickStatsChart";
import CommissionTotal from "../../components/dashboard/CommissionTotal";
import ContractSummaryChart from "../../components/dashboard/ContractSummary";
import ContractTrendChart from "../../components/dashboard/ContractTrendChart";
import NewListings from "../../components/dashboard/NewListings";
import PopularListings from "../../components/dashboard/PopularListings";
import WeeklySchedule from "../../components/dashboard/WeeklySchedule";

export default function Home() {
 return (
    <>
      <PageMeta
        title="중개사 대시보드"
        description="매물/계약/수수료 통계와 최신 활동을 확인하세요."
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* 좌측 영역 (통계) */}
        <div className="col-span-12 xl:col-span-7 space-y-6">
          {/* 계약 상태 요약 */}
          <ContractSummaryChart />

          {/* 클릭/조회수 요약 */}
          <ClickStatsChart />

          {/* 계약 성사 추이 */}
          <ContractTrendChart />
        </div>

        {/* 우측 영역 (최근 활동) */}
        <div className="col-span-12 xl:col-span-5 space-y-6">
          {/* 수수료 합계 */}
          <CommissionTotal />

          {/* 최근 매물 */}
          <NewListings />


          {/* 인기 매물 Top3 */}
          <PopularListings />


          {/* 일정 요약 */}
          <WeeklySchedule />
        </div>
      </div>
    </>
  );
}