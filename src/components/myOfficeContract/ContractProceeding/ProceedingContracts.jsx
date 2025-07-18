import React, { useEffect, useState } from 'react'
import { useSecureAxios } from '../../../hooks/useSecureAxios';

function ProceedingContracts() {
  const [] = useState();
  const [] = useState();
  const [] = useState();
  const [] = useState();
  const [] = useState();
  const [] = useState();
  const [] = useState();
  useEffect(() => { }, []);
  useEffect(() => { }, []);
  useEffect(() => { }, []);
  const axios = useSecureAxios();

  const [procContracts, setProcContracts] = useState();
  useEffect(() => {
    axios.post("cont/proc/list")
      .then(data => {
        console.log("proceeding-contracts:: ", data);
        setProcContracts(data);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  return (
    <>
      <ComponentCard
        title="📝 진행중인 계약"
      >
        {/* 검색요소 */}
        <div className="mb-2 p-3 pb-1 border rounded-xl bg-gray-50">
          <div data-name={"SearchBox^0^"} className="flex flex-row justify-between">
            <div className="flex flex-row gap-3">
              <div className="flex flex-col justify-start">
                <Label className="h-fit text-xs font-semibold">＊ 매물 유형</Label>
                <SelectControlled
                  value={filterListingTypeValue}
                  onChange={(val) => setFilterListingTypeValue(val)}
                  options={listingTypeOptions}
                  placeholder="--매물유형 선택--"
                  className="max-h-9 text-xs w-[90px]"
                />
              </div>
              <div className="flex flex-col justify-start">
                <Label className="h-fit text-xs font-semibold">＊ 거래 유형</Label>
                <SelectControlled
                  value={filterTypeSaleValue}
                  onChange={(val) => setFilterTypeSaleValue(val)}
                  options={typeSaleOptions}
                  placeholder="--거래유형 선택--"
                  className="max-h-9 text-xs w-[90px]"
                />
              </div>

              <div className="flex flex-col justify-start">
                <Label className="h-fit text-xs font-semibold">＊ 거래 상태</Label>
                <SelectControlled
                  value={filterProdStatValue}
                  onChange={(val) => setFilterProdStatValue(val)}
                  options={prodStatOptions}
                  placeholder="--거래상태 선택--"
                  className="max-h-9 text-xs w-[90px]"
                />
              </div>
              <div className="flex flex-col-reverse justify-start mb-3">
                <button
                  onClick={handleResetFilters}
                  className="w-[70px] text-xs text-amber-800 border border-amber-800 rounded px-3 py-1 hover:text-amber-600 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-gray-800"
                >
                  초기화
                </button>
              </div>
            </div>
            <div className="flex flex-row gap-0 items-center mb-2">
              <div className="flex flex-col justify-start h-fit">
                <Label className="h-fit text-xs font-semibold">＊ 검색 조건</Label>
                <SelectControlled
                  value={searchCategory}
                  onChange={(val) => setSearchCategory(val)}
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
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setCurrentPage(1);
                    if (e.target.value.trim() === "") {
                      setBackspaceUsed(true);
                    } else {
                      setBackspaceUsed(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace") setBackspaceUsed(true);
                  }}
                  className="ml-0 w-[200px] max-h-9 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="w-[70px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    번호
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[100px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    유형
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[350px] px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    매물명
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[80px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    임대인
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[120px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    거래유형
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[120px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    거래상태
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[200px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    비고
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedList.map((lstg, idx) => (
                  <TableRow
                    key={lstg.lstgId}
                    className={"hover:bg-gray-100 dark:hover:bg-white/5"}
                  >
                    <TableCell className="px-5 py-4 sm:px-6 text-center">
                      <div className="pointer-events-none flex justify-center items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {idx + 1}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      <div className="pointer-events-none overflow-hidden text-ellipsis whitespace-nowrap">
                        {getListingTypeCode1Name(lstg.lstgTypeCode1)}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div
                        title={lstg.lstgNm}
                        className="cursor-pointer text-gray-500 hover:underline flex -space-x-2 overflow-hidden text-ellipsis whitespace-nowrap"
                        onClick={() => {
                          console.log("📣 Row clicked!", lstg.lstgId);
                          handleSelectListing(lstg.lstgId);
                        }}
                      >
                        {lstg.lstgNm}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="pointer-events-none flex justify-center -space-x-2 text-center overflow-hidden text-ellipsis whitespace-nowrap">
                        {lstg.tenancyInfo !== null
                          ? lstg.tenancyInfo.mbrNm
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm text-center dark:text-gray-400">
                      <div className="pointer-events-none overflow-hidden text-ellipsis whitespace-nowrap">
                        ^0^
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      <div className="pointer-events-none overflow-hidden text-ellipsis whitespace-nowrap">
                        {getListingProdStatName(lstg.lstgProdStat)}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      <div className="pointer-events-none overflow-hidden text-ellipsis whitespace-nowrap"></div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

          </div>
        </div>
        <div>
          <div className="flex flex-row justify-center -space-x-2 gap-3 max-w-full overflow-x-auto">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded ${i + 1 === currentPage ? 'bg-amber-600 border border-amber-400 text-white' : 'bg-gray-100 border border-gray-300 text-gray-400'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </ComponentCard>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        className="max-w-2xl p-4"
      >
        <ComponentCard
          title={selectedListing?.lstgNm || "선택된 매물"}
          desc={`${selectedListing?.lstgAdd || ""} ${selectedListing?.lstgAdd2 || ""
            }`}
        >
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {selectedListing?.lstgNm}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {selectedListing?.lstgAdd} {selectedListing?.lstgAdd2}
                </p>
              </div>
              {getListingProdStatName(selectedListing?.lstgProdStat)}
            </div>

            {/* 이미지 */}
            {selectedListing?.thumbnailUrl && (
              <div className="w-full overflow-hidden rounded-lg">
                <ResponsiveImage
                  src={selectedListing.thumbnailUrl}
                  alt="매물 이미지"
                />
              </div>
            )}

            {/* 상세 정보 그리드 */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-200">
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  전용면적
                </span>
                <br />
                {selectedListing?.lstgExArea}㎡
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  공급면적
                </span>
                <br />
                {selectedListing?.lstgGrArea}㎡
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  임대인
                </span>
                <br />
                {selectedListing?.tenancyInfo?.mbrNm || "정보 없음"}
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  방 번호
                </span>
                <br />
                {selectedListing?.lstgRoomNum || "-"}
              </div>
            </div>

            {/* 상세 설명 */}
            <div className="pt-4 border-t border-gray-100 dark:border-white/10">
              <h3 className="font-medium text-gray-800 dark:text-white mb-1">
                상세 설명
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                {selectedListing?.lstgDst || "설명 없음"}
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end pt-4 gap-3">
              {/* 임대인 정보 입력 버튼 (tenancyInfo가 없을 때만 노출) */}
              {!selectedListing?.tenancyInfo && (
                <Button
                  onClick={handleGoToContract}
                  className="ml-2 text-sm text-white bg-amber-600 hover:bg-amber-800"
                >
                  임대인 정보 입력
                </Button>
              )}
              <Button
                color="gray"
                onClick={() => setModalOpen(false)}
                className="bg-gray-300 text-gray-700 hover:text-gray-200 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
              >
                닫기
              </Button>
              <Button
                color="primary"
                onClick={handleGoToContract}
                disabled={!selectedListing?.tenancyInfo}
                className={`px-6 text-white 
                ${selectedListing?.tenancyInfo
                    ? "bg-amber-600 hover:bg-amber-800"
                    : "bg-gray-300 cursor-not-allowed"
                  }`}
              >
                계약으로 이동
              </Button>
            </div>
          </div>
        </ComponentCard>
      </Modal>
    </>
  )
}

export default ProceedingContracts