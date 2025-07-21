import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useSecureAxios } from "../../../hooks/useSecureAxios";
import ComponentCard from "../../common/ComponentCard";
import SelectControlled from "../../form/SelectControlled";
import Input from "../../form/input/InputField";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import { TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import { Modal } from "../../ui/modal";
import isEqual from "lodash.isequal";
import { useAES256 } from "../../../hooks/useAES256";


function ProceedingContracts() {
  const navigate = useNavigate();
  const axios = useSecureAxios();
  const { encrypt, decrypt } = useAES256();
  const [procContracts, setProcContracts] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false); //계약 생성 후의 로직
  const [contractStatOptions, setContractStatOptions] = useState(null);
  const [contractTypeOptions, setContractTypeOptions] = useState(null);
  const [filterContractStatValue, setFilterContractStatValue] = useState("000");
  const [filterContractTypeValue, setFilterContractTypeValue] = useState("000");
  const [searchCategory, setSearchCategory] = useState("전체");
  const [searchText, setSearchText] = useState("");
  const [backspaceUsed, setBackspaceUsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredList = useMemo(() => {
    const trimmedSearch = searchText.trim().toLowerCase();
    return procContracts?.filter((proc) => {
      if (
        filterContractStatValue !== "000" &&
        proc.contStatCd !== filterContractStatValue
      )
        return false;
      if (
        filterContractTypeValue !== "000" &&
        proc.contTypeCode !== filterContractTypeValue
      )
        return false;
      if (!trimmedSearch || (backspaceUsed && !trimmedSearch)) return true;
      if (searchCategory === "전체") {
        return (
          (proc.listingInfo?.lstgNm || "")
            .toLowerCase()
            .includes(trimmedSearch) ||
          (proc.tenancyInfo?.mbrNm || "")
            .toLowerCase()
            .includes(trimmedSearch) ||
          (proc.listingInfo?.lstgAdd || "")
            .toLowerCase()
            .includes(trimmedSearch) ||
          (proc.lesseeInfo?.mbrNm || "").toLowerCase().includes(trimmedSearch)
        );
      }
      const value = (() => {
        switch (searchCategory) {
          case "매물명":
            return proc.listingInfo?.lstgNm || "";
          case "임대인":
            return proc.tenancyInfo?.mbrNm || "";
          case "임차인":
            return proc.lesseeInfo?.mbrNm || "";
          case "주소":
            return (<proc className="listingInfo"></proc>)?.lstgAdd || "";
          default:
            return "";
        }
      })();
      return value.toLowerCase().includes(trimmedSearch);
    });
  }, [
    procContracts,
    searchCategory,
    searchText,
    backspaceUsed,
    filterContractTypeValue,
    filterContractStatValue,
  ]);

  const handleResetFilters = () => {
    setFilterContractStatValue("000");
    setFilterContractTypeValue("000");
    setSearchCategory("전체");
    setSearchText("");
    setBackspaceUsed(false);
    setCurrentPage(1);
  };

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return (filteredList || []).slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);
  const totalPages = Math.ceil((filteredList || []).length / itemsPerPage);

  const getContractTypeName = (contractType) => {
    const matchedType = contractTypeOptions?.find(
      (opt) => opt.value === contractType
    );
    return matchedType ? matchedType.label : "미정";
  };

  const getContractStatName = (contractStat) => {
    const matched = contractStatOptions?.find(
      (opt) => opt.value === contractStat
    );
    const getColor = (code) => {
      switch (code) {
        case "001":
          return "success";
        case "002":
          return "primary";
        case "003":
          return "light";
        case "004":
          return "dark";
        case "005":
          return "error";
        default:
          return "warning";
      }
    };
    return (
      <Badge size="sm" color={getColor(contractStat)}>
        {matched ? matched.label : "미정"}
      </Badge>
    );
  };

  useEffect(() => {
    axios
      .post("form", {
        codeGroup: {
          contractStatList: "CONTR",
          contractTypeList: "TRDST",
        },
      })
      .then((data) => {
        const contrOpt = data.contractStatList.map((contr) => ({
          ...contr,
          value: contr.codeValue,
          label: contr.codeName,
        }));
        const trdstOpt = data.contractTypeList.map((trdst) => ({
          ...trdst,
          value: trdst.codeValue,
          label: trdst.codeName,
        }));
        setContractStatOptions(contrOpt);
        setContractTypeOptions(trdstOpt);
        return { contrOpt, trdstOpt };
      })
      .then(({ contrOpt, trdstOpt }) => {
        console.log(contractStatOptions, contractTypeOptions);
      });

    axios
      .post("cont/proc/list")
      .then((data) => {
        // console.log("proceeding-contracts:: ", data);
        if (!isEqual(data, procContracts)) {
          setProcContracts(data);
        }
        return data;
      })
      .then((data) =>
        console.log(
          `%c[STATE] procContracts`,
          "color:yellow; font-weight:bold",
          procContracts
        )
      );

    if (hasShownModal || !procContracts) return;
    const localStorageKey = encrypt("NEXT_PROCEEDING-CONTRACT");
    const localStorageValue = localStorage.getItem(localStorageKey);
    const contractId = localStorageValue !== null ? decrypt(localStorageValue) : "";
    console.log("12094urfc932u", contractId);
    if (!contractId || !procContracts) return;
    if (contractId && procContracts && procContracts.length > 0) {
      const matchedContract = procContracts.find((c) => c.contId === contractId);

      if (matchedContract) {
        setSelectedContract(matchedContract);
        setShowModal(true);
        localStorage.removeItem(localStorageKey);
      }
    }
  }, []);


  const handleContractSignaturePage = (contId) => {
    navigate("/contract", { state: { contId } });

  }
  return (
    <>
      <ComponentCard title="📝 진행중인 계약">
        {/* 검색요소 */}
        <div className="mb-2 p-3 pb-1 border rounded-xl bg-gray-50">
          <div
            data-name={"SearchBox^0^"}
            className="flex flex-row justify-between"
          >
            <div className="flex flex-row gap-3">
              <div className="flex flex-col justify-start">
                <Label className="h-fit text-xs font-semibold">
                  ＊ 계약 유형
                </Label>
                <SelectControlled
                  value={filterContractTypeValue}
                  onChange={(val) => setFilterContractTypeValue(val)}
                  options={contractTypeOptions}
                  placeholder="--매물유형 선택--"
                  className="max-h-9 text-xs w-[90px]"
                />
              </div>
              <div className="flex flex-col justify-start">
                <Label className="h-fit text-xs font-semibold">
                  ＊ 계약 상태
                </Label>
                <SelectControlled
                  value={"001"}
                  disabled
                  options={contractStatOptions}
                  placeholder="--계약상태 선택--"
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
                <button
                  onClick={handleCheckboxProcess}
                  className="w-[70px] text-xs text-amber-800 border border-amber-800 rounded px-3 py-1 hover:text-amber-600 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-gray-800"
                >
                  일괄
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
                    { label: "임차인", value: "임차인" },
                    { label: "주소", value: "주소" },
                  ]}
                  className="mr-2 max-h-9 text-xs w-[90px]"
                />
              </div>
              <div className="flex flex-col justify-start h-fit">
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
                  className="ml-0 w-[200px] max-h-9 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 계약 리스트 테이블 */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <table>
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
                    className="w-[120px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
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
                    className="w-[150px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    임차인
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[150px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    계약 등록일시
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[200px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    보증/전세금
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[100px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    상태
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[100px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    개설
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedList && paginatedList.length > 0 ? (
                  paginatedList.map((proc, idx) => (
                    <TableRow
                      key={proc.contId}
                      onClick={() => {
                        console.log("Row 클릭 핸들러");
                        setSelectedContract(proc);
                        setShowModal(true);
                      }}
                      className={
                        "cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5"
                      }
                    >
                      <TableCell className="px-5 py-4 sm:px-6 text-center">
                        <div className="flex justify-center items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {idx + 1}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                          {getContractTypeName(proc.contTypeCode)}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                        <div
                          title={proc.listingInfo?.lstgAdd}
                          className=" text-gray-500 hover:underline flex -space-x-2 overflow-hidden text-ellipsis whitespace-nowrap"
                          onClick={() => {
                            console.log(
                              "📣 Row clicked!",
                              proc.listingInfo?.lstgId,
                              proc.contId
                            );
                            // handleSelectListing(lstg.lstgId);
                          }}
                        >
                          {proc.listingInfo?.lstgNm || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex justify-center -space-x-2 text-center overflow-hidden text-ellipsis whitespace-nowrap">
                          {proc.tenancyInfo !== null
                            ? proc.tenancyInfo.mbrNm
                            : "-"}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex justify-center -space-x-2 text-center overflow-hidden text-ellipsis whitespace-nowrap">
                          {proc.lesseeInfo !== null
                            ? proc.lesseeInfo.mbrNm
                            : "-"}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm text-center dark:text-gray-400">
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                          {proc.contDtm}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm text-center dark:text-gray-400">
                        <div className="overflow-hidden text-right whitespace-nowrap">
                          {proc.contDeposit != null
                            ? Number(proc.contDeposit).toLocaleString("ko-KR") +
                            " 원"
                            : "-"}{" "}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                          {getContractStatName(proc.contStatCd)}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                          {" "}
                          <button
                            className="w-[50px] text-xs text-amber-800 border border-amber-800 rounded px-3 py-1 hover:text-amber-600 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-gray-800 "
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContractSignaturePage(proc.contId);
                            }}
                          >
                            개설
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-400">
                      조건에 맞는 계약이 없습니다.
                    </td>
                  </tr>
                )}
              </TableBody>
            </table>
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
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        className="max-w-2xl p-4"
      >
        <ComponentCard
          title={selectedContract?.listingInfo?.lstgNm || "계약 상세 정보"}
          desc={`계약 ID: ${selectedContract?.contId || "-"}`}
        >
          <div className="p-6 space-y-6">
            {/* 상단 정보 */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {selectedContract?.listingInfo?.lstgNm}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {selectedContract?.listingInfo?.lstgAdd}{" "}
                  {selectedContract?.listingInfo?.lstgAdd2}
                </p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-300">
                {getContractStatName(selectedContract?.contStatCd)}
              </div>
            </div>

            {/* 상세 정보 그리드 */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-200">
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  임대인
                </span>
                <br />
                {selectedContract?.tenancyInfo?.mbrNm || "정보 없음"}
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  임차인
                </span>
                <br />
                {selectedContract?.lesseeInfo?.mbrNm || "정보 없음"}
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  계약일시
                </span>
                <br />
                {(selectedContract?.contDtm || "-").split(" ").map((t, i) => (
                  <div key={i}>{t}</div>
                ))}
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  계약유형
                </span>
                <br />
                {getContractTypeName(selectedContract?.contTypeCode)}
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end pt-4 gap-3">
              <Button
                color="gray"
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-700 hover:text-gray-200 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
              >
                닫기
              </Button>
            </div>
          </div>
        </ComponentCard>
      </Modal>
    </>
  );
}

export default ProceedingContracts;
