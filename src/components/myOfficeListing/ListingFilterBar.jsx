import SelectControlled from "../form/SelectControlled";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function ListingFilterBar({
  filterTypeSaleValue,
  filterProdStatValue,
  searchCategory,
  searchText,
  listingDetailTypeOptions,
  typeSaleOptions,
  prodStatOptions,
  filterListingDetailTypeValue,
  setFilterTypeSaleValue,
  setFilterProdStatValue,
  setSearchCategory,
  setSearchText,
  setFilterListingDetailTypeValue,
  handleResetFilters,
  filterStartDate,
  filterEndDate,
  setFilterStartDate,
  setFilterEndDate,
}) {
  return (
    <div className="mb-2 p-3 pb-1 border rounded-xl bg-gray-50">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-3">


          {/* 상세유형 */}
          <div className="flex flex-col justify-start">
            <Label className="h-fit text-xs font-semibold">
              ＊ 매물 상세 유형
            </Label>
            <SelectControlled
              value={filterListingDetailTypeValue}
              onChange={setFilterListingDetailTypeValue}
              options={listingDetailTypeOptions}
              placeholder="--상세유형 선택--"
              className="max-h-9 text-xs w-[90px]"
            />
          </div>

          {/* 거래유형 */}
          <div className="flex flex-col justify-start">
            <Label className="h-fit text-xs font-semibold">＊ 거래 유형</Label>
            <SelectControlled
              value={filterTypeSaleValue}
              onChange={setFilterTypeSaleValue}
              options={typeSaleOptions}
              placeholder="--거래유형 선택--"
              className="max-h-9 text-xs w-[90px]"
            />
          </div>

          {/* 거래상태 */}
          <div className="flex flex-col justify-start">
            <Label className="h-fit text-xs font-semibold">＊ 거래 상태</Label>
            <SelectControlled
              value={filterProdStatValue}
              onChange={setFilterProdStatValue}
              options={prodStatOptions}
              placeholder="--거래상태 선택--"
              className="max-h-9 text-xs w-[90px]"
            />
          </div>
        </div>
        {/* 등록일 (시작 ~ 종료) */}
        <div className="flex flex-col justify-start">
          <Label className="h-fit text-xs font-semibold">＊ 등록일</Label>
          <div className="flex flex-row gap-1 items-center">
            <Input
              type="date"
              value={filterStartDate}
              defaultValue={""}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="max-h-9 text-xs w-[130px]"
            />

            <span className="text-xs text-gray-500">~</span>
            <Input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="max-h-9 text-xs w-[130px]"
            />
          </div>
        </div>
        {/* 검색 영역 */}
        <div className="flex flex-row gap-0 items-center mb-2">
          <div className="flex flex-col justify-start h-fit">
            <Label className="h-fit text-xs font-semibold">＊ 검색 조건</Label>
            <SelectControlled
              value={searchCategory}
              onChange={setSearchCategory}
              placeholder="--선택--"
              options={[
                { label: "전체검색", value: "전체" },
                { label: "매물명", value: "매물명" },
                { label: "임대인", value: "임대인" },
                { label: "주소", value: "주소" },
              ]}
              className="mr-2 max-h-9 text-xs w-[90px]"
            />
          </div>

          <div className="flex flex-col justify-start h-fit">
            <Label className="h-fit text-xs font-semibold invisible">.</Label>
            <Input
              type="text"
              placeholder="검색어 입력"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="ml-0 w-[200px] max-h-9 text-xs"
            />
          </div>

          <button
            onClick={handleResetFilters}
            className="h-9 w-[70px] mt-auto text-xs ml-2 text-amber-800 border border-amber-800 rounded px-3 py-1 
              hover:text-amber-600 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-gray-800"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  );
}
