import SelectControlled from "../form/SelectControlled";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function ListingFilterBar({
  filterListingTypeValue,
  filterTypeSaleValue,
  filterProdStatValue,
  searchCategory,
  searchText,
  listingTypeOptions,
  typeSaleOptions,
  prodStatOptions,
  setFilterListingTypeValue,
  setFilterTypeSaleValue,
  setFilterProdStatValue,
  setSearchCategory,
  setSearchText,
  handleResetFilters,
}) {
  return (
    <div className="mb-2 p-3 pb-1 border rounded-xl bg-gray-50">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-3">
          <div className="flex flex-col justify-start">
            <Label className="h-fit text-xs font-semibold">＊ 매물 유형</Label>
            <SelectControlled
              value={filterListingTypeValue}
              onChange={setFilterListingTypeValue}
              options={listingTypeOptions}
              placeholder="--매물유형 선택--"
              className="max-h-9 text-xs w-[90px]"
            />
          </div>
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
          <div className="flex flex-col-reverse justify-start mb-3">
          </div>
        </div>

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
