import { useEffect, useState } from "react";
import { useAxios } from "../../hooks/useAxios";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import ResponsiveImage from "../ui/images/ResponsiveImage";
import { Modal } from "../ui/modal";

function ContractListingSelect({ onSelect }) {

  const axios = useAxios();
  const [lstgList, setLstgList] = useState([]);
  useEffect(() => {
    axios.get("/cont/new/listing")
      .then(data => {
        setLstgList(data);
      })
      .catch(error => console.log("안된다~", error))


  }, []);


  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const handleSelectListing = (lstgId) => {
    const target = lstgList.find(lstgTarget => lstgTarget.lstgId === lstgId);
    setSelectedListing(target);
    setModalOpen(true);
  };


  const handleGoToContract = () => {
    onSelect(selectedListing); // 부모에 선택값 전달!
    setModalOpen(false);
  };


  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  번호
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  유형
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  매물명
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  임대인
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  거래유형
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  거래상태
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  비고
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {lstgList.map(lstg => (
                <TableRow
                  key={lstg.lstgId}
                  className={"hover:bg-gray-100 dark:hover:bg-white/5"}
                >
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="pointer-events-none flex items-center gap-3">
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        {lstg.indexNo}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="pointer-events-none ">
                      {/* {getListingTypeName(lstg.lstgTypeSale) === 1 ? } */}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="cursor-pointer text-gray-500 hover:underline flex -space-x-2"
                      onClick={() => { console.log("📣 Row clicked!", lstg.lstgId); handleSelectListing(lstg.lstgId); }}>
                      {lstg.lstgNm}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="pointer-events-none flex -space-x-2">
                      {lstg.tenancyInfo !== null ? lstg.tenancyInfo.mbrNm : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="pointer-events-none">
                      <Badge
                        size="sm"
                        color={
                          lstg.lstgStatCode === "ACTIVE"
                            ? "success"
                            : lstg.lstgStatCode === "CONTRACTED"
                              ? "warning"
                              : "error"
                        }
                      >
                        {lstg.lstgProdStat}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="pointer-events-none ">
                      ^0^
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>


      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} className="max-w-2xl p-4">
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{selectedListing?.lstgNm}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {selectedListing?.lstgAdd} {selectedListing?.lstgAdd2}
              </p>
            </div>
            <Badge
              color={
                selectedListing?.lstgStatCode === "ACTIVE"
                  ? "success"
                  : selectedListing?.lstgStatCode === "CONTRACTED"
                    ? "warning"
                    : "error"
              }
            >
              {selectedListing?.lstgProdStat}
            </Badge>
          </div>

          {/* 이미지 */}
          {selectedListing?.thumbnailUrl && (
            <div className="w-full overflow-hidden rounded-lg">
              <ResponsiveImage src={selectedListing.thumbnailUrl} alt="매물 이미지" />
            </div>
          )}

          {/* 상세 정보 그리드 */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-200">
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-300">전용면적</span><br />
              {selectedListing?.lstgExArea}㎡
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-300">공급면적</span><br />
              {selectedListing?.lstgGrArea}㎡
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-300">임대인</span><br />
              {selectedListing?.tenancyInfo?.mbrNm || "정보 없음"}
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-300">방 번호</span><br />
              {selectedListing?.lstgRoomNum || "-"}
            </div>
          </div>

          {/* 상세 설명 */}
          <div className="pt-4 border-t border-gray-100 dark:border-white/10">
            <h3 className="font-medium text-gray-800 dark:text-white mb-1">상세 설명</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {selectedListing?.lstgDst || "설명 없음"}
            </p>
          </div>

          <div className="flex justify-end pt-4 gap-3">
            {/* 임대인 정보 입력 버튼 (tenancyInfo가 없을 때만 노출) */}
            {!selectedListing?.tenancyInfo && (
              <Button
                onClick={() => onSelect(selectedListing)}
                className="ml-2 text-sm text-white bg-blue-500 hover:bg-blue-600"
              >
                임대인 정보 입력
              </Button>
            )}

            {/* 닫기 버튼 */}
            <Button
              color="gray"
              onClick={() => setModalOpen(false)}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
            >
              닫기
            </Button>

            {/* 계약으로 이동 버튼 (항상 노출, 단 조건부로 disabled 처리) */}
            <Button
              color="primary"
              onClick={handleGoToContract}
              disabled={!selectedListing?.tenancyInfo} // 핵심!
              className={`px-6 text-white 
      ${selectedListing?.tenancyInfo ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              계약으로 이동
            </Button>
          </div>
        </div>
      </Modal>


    </>
  )
}

export default ContractListingSelect