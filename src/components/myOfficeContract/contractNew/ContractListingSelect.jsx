import { useEffect, useMemo, useState } from "react";
import { useSecureAxios } from "../../../hooks/useSecureAxios";
import ComponentCard from "../../common/ComponentCard";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import SelectControlled from "../../form/SelectControlled";
import Input from "../../form/input/InputField";

import ResponsiveImage from "../../ui/images/ResponsiveImage";
import { Modal } from "../../ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Label from "../../form/Label";
import { useContractInfo } from "../../../context/ContractInfoContext";

function ContractListingSelect({ onSave }) {
  const axios = useSecureAxios();
  const [lstgList, setLstgList] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const { contractInfo, setContractInfo } = useContractInfo();

  // 공통코드 옵션, 검색어, 페이지네이션
  const [listingTypeOptions, setListingTypeOptions] = useState([]);
  const [listingTypeDetailOptions, setListingTypeDetailOptions] = useState([]);
  const [typeSaleOptions, setTypeSaleOptions] = useState([]);
  const [prodStatOptions, setProdStatOptions] = useState([]);
  const [filterListingTypeValue, setFilterListingTypeValue] = useState("000");
  const [filterListingTypeDetailValue, setFilterListingTypeDetailValue] =
    useState("000");
  const [filterTypeSaleValue, setFilterTypeSaleValue] = useState("000");
  const [filterProdStatValue, setFilterProdStatValue] = useState("000");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0]; // 예: "2025-07-21"
  });
  const [searchCategory, setSearchCategory] = useState("전체");
  const [searchText, setSearchText] = useState("");
  const [backspaceUsed, setBackspaceUsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [clickedRowId, setClickedRowId] = useState(null);


  const isValidDate = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return (
      date instanceof Date &&
      !isNaN(date) &&
      dateStr === date.toISOString().slice(0, 10)
    );
  };

  useEffect(() => {
    axios
      .post("/cont/new/listing")
      .then((data) => setLstgList(data))
      .catch((error) => console.log("안된다~", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    axios
      .post("form", {
        codeGroup: {
          typeSale: "TRDST",
          prodStat: "PRDST",
          listingType: "LSTG1",
          listingTypeDetail: "LSTG2",
        },
      })
      .then((data) => {
        const trdstOpt = data.typeSale.map((trdst) => ({
          ...trdst,
          value: trdst.codeValue,
          label: trdst.codeName,
        }));
        const prdstOpt = data.prodStat.map((prdst) => ({
          ...prdst,
          value: prdst.codeValue,
          label: prdst.codeName,
        }));
        const lstg1Opt = data.listingType.map((lstg1) => ({
          ...lstg1,
          value: lstg1.codeValue,
          label: lstg1.codeName,
        }));
        const lstg2Opt = data.listingTypeDetail.map((lstg2) => ({
          ...lstg2,
          value: lstg2.codeValue,
          label: lstg2.codeName,
        }));
        setTypeSaleOptions(trdstOpt);
        setProdStatOptions(prdstOpt);
        setListingTypeOptions(lstg1Opt);
        setListingTypeDetailOptions(lstg2Opt);
      })
      .catch((err) => {
        console.error("공통코드 오류남(ContractListingSelect)", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const getListingTypeCode1Name = (lstgTypeCode1) => {
    const matched = listingTypeOptions.find(
      (opt) => opt.value === lstgTypeCode1
    );
    return matched ? matched.label : "기타";
  };

  const getListingTypeCode2Name = (lstgTypeCode2) => {
    const matched = listingTypeDetailOptions.find(
      (opt) => opt.value === lstgTypeCode2
    );
    return matched ? matched.label : "기타";
  };

  const getListingTypeSaleName = (lstgTypeSale) => {
    const matched = typeSaleOptions.find((opt) => opt.value === lstgTypeSale);
    return matched ? matched.label : "기타";
  };

  const getListingProdStatName = (lstgProdStat) => {
    const matched = prodStatOptions.find((opt) => opt.value === lstgProdStat);
    const getColor = (code) => {
      switch (code) {
        case "001":
          return "success";
        case "002":
          return "warning";
        case "003":
          return "error";
        default:
          return "gray";
      }
    };
    return (
      <Badge size="sm" color={getColor(lstgProdStat)}>
        {matched ? matched.label : "미정"}
      </Badge>
    );
  };

  const filteredList = useMemo(() => {
    const trimmedSearch = searchText.trim().toLowerCase();
    return lstgList.filter((lstg) => {
      const regDate = lstg.lstgRegDate?.split("T")[0]; // "2025-07-20"
      // 🔹 날짜 범위 조건
      if (filterStartDate && regDate < filterStartDate) return false;
      if (filterEndDate && regDate > filterEndDate) return false;

      if (
        filterListingTypeValue !== "000" &&
        lstg.lstgTypeCode1 !== filterListingTypeValue
      )
        return false;
      if (
        filterListingTypeDetailValue !== "000" &&
        lstg.lstgTypeCode2 !== filterListingTypeDetailValue
      )
        return false;
      if (
        filterTypeSaleValue !== "000" &&
        lstg.lstgTypeSale !== filterTypeSaleValue
      )
        return false;
      if (
        filterProdStatValue !== "000" &&
        lstg.lstgProdStat !== filterProdStatValue
      )
        return false;
      if (!trimmedSearch || (backspaceUsed && !trimmedSearch)) return true;
      if (searchCategory === "전체") {
        return (
          (lstg.lstgNm || "").toLowerCase().includes(trimmedSearch) ||
          (lstg.tenancyInfo?.mbrNm || "")
            .toLowerCase()
            .includes(trimmedSearch) ||
          (lstg.lstgAdd || "").toLowerCase().includes(trimmedSearch)
        );
      }
      const value = (() => {
        switch (searchCategory) {
          case "매물명":
            return lstg.lstgNm || "";
          case "임대인":
            return lstg.tenancyInfo?.mbrNm || "";
          case "주소":
            return lstg.lstgAdd || "";
          default:
            return "";
        }
      })();
      return value.toLowerCase().includes(trimmedSearch);
    });
  }, [
    lstgList,
    searchCategory,
    searchText,
    backspaceUsed,
    filterListingTypeValue,
    filterListingTypeDetailValue,
    filterTypeSaleValue,
    filterProdStatValue,
    filterStartDate,
    filterEndDate,
  ]);

  const handleResetFilters = () => {
    setFilterListingTypeValue("000");
    setFilterListingTypeDetailValue("000");
    setFilterTypeSaleValue("000");
    setFilterProdStatValue("000");
    setSearchCategory("전체");
    setSearchText("");
    setBackspaceUsed(false);
    setCurrentPage(1);
    setFilterStartDate("");
    setFilterEndDate(() => {
      const now = new Date();
      return now.toISOString().split("T")[0]; // 예: "2025-07-21"
    });
    setClickedRowId(null);

  };

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  return (
    <>
      <ComponentCard title="📝 계약할 매물 선택">
        {/* 검색요소 */}
        <div className="mb-2 p-3 pb-1 border rounded-xl bg-gray-50">
          <div
            data-name={"SearchBox^0^"}
            className="flex flex-row justify-between"
          >
            <div className="flex flex-row gap-3">
              <div className="flex flex-col justify-start">
                <Label className="h-fit text-xs font-semibold">
                  ＊ 매물 유형
                </Label>
                <SelectControlled
                  value={filterListingTypeDetailValue}
                  onChange={(val) => setFilterListingTypeDetailValue(val)}
                  options={listingTypeDetailOptions}
                  placeholder="--매물유형 선택--"
                  className="max-h-9 text-xs w-[90px]"
                />
              </div>
              <div className="flex flex-col justify-start">
                <Label className="h-fit text-xs font-semibold">
                  ＊ 거래 유형
                </Label>
                <SelectControlled
                  value={filterTypeSaleValue}
                  onChange={(val) => setFilterTypeSaleValue(val)}
                  options={typeSaleOptions}
                  placeholder="--거래유형 선택--"
                  className="max-h-9 text-xs w-[90px]"
                />
              </div>

              <div className="flex flex-col justify-start">
                <Label className="h-fit text-xs font-semibold">
                  ＊ 거래 상태
                </Label>
                <SelectControlled
                  value={filterProdStatValue}
                  onChange={(val) => setFilterProdStatValue(val)}
                  options={prodStatOptions}
                  placeholder="--거래상태 선택--"
                  className="max-h-9 text-xs w-[90px]"
                />
              </div>
              <div className="flex flex-col justify-start h-fit">
                <Label className="h-fit text-xs font-semibold">＊ 시작일</Label>
                <Input
                  type="date"
                  value={isValidDate(filterStartDate) ? filterStartDate : ""}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  onFocus={(e) => e.target.showPicker && e.target.showPicker()} // 💥
                  className="pl-2 pr-2 ml-0 w-[130px] max-h-9 text-xs"
                  onKeyDown={(e) => {
                    const allowed = [
                      "0",
                      "1",
                      "2",
                      "3",
                      "4",
                      "5",
                      "6",
                      "7",
                      "8",
                      "9",
                      "-",
                      "Backspace",
                      "ArrowLeft",
                      "ArrowRight",
                    ];
                    if (!allowed.includes(e.key)) {
                      e.preventDefault(); // 숫자와 하이픈 외 입력 차단
                    }
                  }}
                />
              </div>
              <div className="flex flex-col justify-start h-fit">
                <Label className="h-fit text-xs font-semibold invisible">
                  ~
                </Label>
                <span className="pt-2">~</span>
              </div>
              <div className="flex flex-col justify-start h-fit">
                <Label className="h-fit text-xs font-semibold">＊ 종료일</Label>
                <Input
                  type="date"
                  value={isValidDate(filterEndDate) ? filterEndDate : ""}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  onFocus={(e) => e.target.showPicker && e.target.showPicker()} // 💥
                  className="pl-2 pr-2 ml-0 w-[130px] max-h-9 text-xs"
                  onKeyDown={(e) => {
                    const allowed = [
                      "0",
                      "1",
                      "2",
                      "3",
                      "4",
                      "5",
                      "6",
                      "7",
                      "8",
                      "9",
                      "-",
                      "Backspace",
                      "ArrowLeft",
                      "ArrowRight",
                    ];
                    if (!allowed.includes(e.key)) {
                      e.preventDefault(); // 숫자와 하이픈 외 입력 차단
                    }
                  }}
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
                <Label className="h-fit text-xs font-semibold">
                  ＊ 검색 조건
                </Label>
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
              <div className="relative flex flex-col justify-start h-fit">
                <Label className="h-fit text-xs font-semibold invisible">
                  .
                </Label>
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
                  className="ml-0 w-[200px] max-h-9 text-xs pr-10"
                />
                <span className="material-icons absolute right-1.5 top-[23px] text-gray-400 text-sm cursor-pointer hover:text-amber-300">
                  search
                </span>
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
                    className="w-[450px] px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    매물명
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[150px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    임대인
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[100px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    거래유형
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[100px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    매물 등록일자
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[100px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    거래상태
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[100px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    비고
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedList.length > 0 ? (
                  paginatedList.map((lstg, idx) => (
                    <TableRow
                      key={lstg.lstgId}
                      onClick={() => {
                        setClickedRowId(lstg.lstgId); // 클릭된 Row 기억
                        console.log("📣 Row clicked!", lstg.lstgId);
                        handleSelectListing(lstg.lstgId);
                      }}
                      className={`cursor-pointer ${clickedRowId === lstg.lstgId
                        ? "bg-gray-200 dark:bg-gray-700"  // ✅ 클릭된 Row의 고정 배경색
                        : "hover:bg-gray-100 dark:hover:bg-white/5"
                        }`}
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
                          {getListingTypeCode2Name(lstg.lstgTypeCode2)}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div
                          title={lstg.lstgNm}
                          className="cursor-pointer text-gray-500 hover:underline flex -space-x-2 overflow-hidden text-ellipsis whitespace-nowrap"

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
                          {getListingTypeSaleName(lstg.lstgTypeSale)}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                        <div className="pointer-events-none overflow-hidden text-ellipsis whitespace-nowrap">
                          {lstg.lstgRegDate?.split("T")[0]}
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
                  ))
                ) : (
                  <TableRow
                    className={"hover:bg-gray-100 dark:hover:bg-white/5"}
                  >
                    <TableCell
                      className="text-gray-500 text-theme-xs dark:text-gray-400"
                      colSpan={8}
                    >
                      <div className="py-4 pointer-events-none overflow-hidden text-center text-lg whitespace-nowrap">
                        없어요
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div>
          <div className="flex flex-row justify-center -space-x-2 gap-3 max-w-full overflow-x-auto">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded ${i + 1 === currentPage
                  ? "bg-amber-600 border border-amber-400 text-white"
                  : "bg-gray-100 border border-gray-300 text-gray-400"
                  }`}
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
  );
}

export default ContractListingSelect;
