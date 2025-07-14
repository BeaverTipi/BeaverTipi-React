import { useEffect, useState } from "react";
import { useSecureAxios } from "../../../hooks/useSecureAxios";
import ComponentCard from "../../common/ComponentCard";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import ResponsiveImage from "../../ui/images/ResponsiveImage";
import { Modal } from "../../ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

function ContractListingSelect({ onSave, contractInfo }) {
  console.log("데이터 추가 확인-->", contractInfo);
  const [lstgList, setLstgList] = useState([]);
  const [lesserTypeList, setLesserTypeList] = useState([]);
  const axios = useSecureAxios();

  useEffect(() => {
    axios
      .get("/cont/new/listing")
      .then((data) => setLstgList(data))
      .catch((error) => console.log("안된다~", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    axios
      .post("/form", { codeGroup: { lesserTypeList: "LSR" } })
      .then((data) => setLesserTypeList(data.lesserTypeList));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const handleSelectListing = (lstgId) => {
    const target = lstgList.find((lstgTarget) => lstgTarget.lstgId === lstgId);
    setSelectedListing(target);
    setModalOpen(true);
  };

  const handleGoToContract = () => {
    console.log("handleGoToContract(), selectedListing::", selectedListing);
    onSave(selectedListing); // 부모에 선택값 전달!
    setModalOpen(false);
  };

  const [filterType, setFilterType] = useState(""); // 선택된 매물유형
  const [filterName, setFilterName] = useState(""); // 입력된 매물명
  const [filteredList, setFilteredList] = useState(lstgList); // 필터링된 결과 리스트
  useEffect(() => {
    const filtered = lstgList.filter((item) => {
      const matchesType = filterType ? item.lstgTypeSale === filterType : true;
      const matchesName = filterName
        ? item.lstgNm?.toLowerCase().includes(filterName.toLowerCase())
        : true;
      return matchesType && matchesName;
    });
    setFilteredList(filtered);
  }, [filterType, filterName, lstgList]);

  const getListingTypeCode1Name = (lstgTypeCode1) => {
    if (lstgTypeCode1 === 1) return "아파트";
    else if (lstgTypeCode1 === 2) return "빌라";
    else if (lstgTypeCode1 === 3) return "오피스텔";
    else if (lstgTypeCode1 === 4) return "단독주택";
    else if (lstgTypeCode1 === 5) return "상가주택";
    else if (lstgTypeCode1 === 6) return "상가";
    else if (lstgTypeCode1 === 7) return "오피스";
    else if (lstgTypeCode1 === 8) return "기타";
    else return "기타";
  };

  const getListingProdStatName = (lstgProdStat) => {
    return (
      <Badge
        size="sm"
        color={
          lstgProdStat === 1
            ? "success"
            : lstgProdStat === 2
              ? "warning"
              : "error"
        }
      >
        {lstgProdStat === 1 ? "활성" : lstgProdStat === 2 ? "비활성" : "숨김"}
      </Badge>
    );
  };

  return (
    <>
      <ComponentCard
        title="📝 계약할 매물 선택"
      >
        {/* 검색요소 */}
        <div className="flex flex-row">
          <div>
            <label htmlFor="lsr">매물유형</label>
            <select
              id="lsr"
              name="lsr"
              value={filterType || ""}
              onChange={(e) => setFilterType(e.target.value)}
            >
              {lesserTypeList.map((opt) => (
                <option key={opt.codeValue} value={opt.codeValue}>
                  {opt.codeName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="lstgNm">매물명</label>
            <input
              id="lstgNm"
              type="text"
              defaultValue=""
              onChange={(e) => setFilterName(e.target.value)}
            />
          </div>
          <button type="button" onClick={(e) => setFilterName(e.target.value)}>
            검색
          </button>
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
                    className="w-[400px] px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
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
                {filteredList.map((lstg, idx) => (
                  <TableRow
                    key={lstg.lstgId}
                    className={"hover:bg-gray-100 dark:hover:bg-white/5"}
                  >
                    <TableCell className="px-5 py-4 sm:px-6 text-center">
                      <div className="pointer-events-none flex items-center gap-3">
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {idx + 1}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      <div className="pointer-events-none ">
                        {getListingTypeCode1Name(lstg.lstgTypeCode1)}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div
                        className="cursor-pointer text-gray-500 hover:underline flex -space-x-2"
                        onClick={() => {
                          console.log("📣 Row clicked!", lstg.lstgId);
                          handleSelectListing(lstg.lstgId);
                        }}
                      >
                        {lstg.lstgNm}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="pointer-events-none flex -space-x-2 text-center">
                        {lstg.tenancyInfo !== null
                          ? lstg.tenancyInfo.mbrNm
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm text-center dark:text-gray-400">
                      <div className="pointer-events-none ">^0^</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      <div className="pointer-events-none">
                        {getListingProdStatName(lstg.lstgProdStat)}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      <div className="pointer-events-none"></div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
  );
}

export default ContractListingSelect;
