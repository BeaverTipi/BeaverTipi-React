import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useSecureAxios } from "../../../hooks/useSecureAxios";
import ComponentCard from "../../common/ComponentCard";
import SelectControlled from "../../form/SelectControlled";
import Input from "../../form/input/InputField";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import { TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import Checkbox from "../../form/input/Checkbox";
import { Modal } from "../../ui/modal";
import isEqual from "lodash.isequal";
import { useAES256 } from "../../../hooks/useAES256";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


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


  /*(1/5)↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓*/
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0]; // 예: "2025-07-21"
  });
  const isValidDate = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return (
      date instanceof Date &&
      !isNaN(date) &&
      dateStr === date.toISOString().slice(0, 10)
    );
  };

  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]); // 체크된 contId 목록
  const handleToggleBulkMode = () => {
    setIsBulkMode(!isBulkMode);
    setSelectedIds([]); // 모드 변경 시 선택 초기화
  };
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      return Swal.fire({
        title: '안내',
        text: '선택된 계약이 없습니다.',
        icon: 'info',
        timer: 1500,
        showConfirmButton: false,
      });
    }
    const confirmed = await Swal.fire({
      title: '삭제 확인',
      text: `${selectedIds.length}건의 계약을 삭제하시겠습니까?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: '삭제하기',
      cancelButtonText: '취소',
    });
    if (!confirmed.isConfirmed) return;

    try {
      await axios.post("cont/delete/bulk", selectedIds); // ✅ 경로 점검
      setProcContracts(prev => prev.filter(c => !selectedIds.includes(c.contId)));
      setSelectedIds([]);
      setIsBulkMode(false); // ✅ 성공시에만 종료

      Swal.fire({
        title: '삭제 완료',
        text: '선택한 계약이 삭제되었습니다.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("삭제 오류:", err);
      Swal.fire({
        title: '삭제 실패',
        text: '삭제 중 오류가 발생했습니다.',
        icon: 'error', // ✅ 수정됨
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };
  const handleToggleAllCurrentPage = () => {
    const currentIds = paginatedList.map((item) => item.contId);
    const allSelected = currentIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      // 전체 해제
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      // 전체 선택
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const filteredList = useMemo(() => {
    const trimmedSearch = searchText.trim().toLowerCase();
    return procContracts?.filter((proc) => {
      const regDate = proc.contDtm?.split(" ")[0]; // "2025-07-20"
      // 🔹 날짜 범위 조건
      if (filterStartDate && regDate < filterStartDate) return false;
      if (filterEndDate && regDate > filterEndDate) return false;
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
    filterStartDate,
    filterEndDate,
  ]);

  const handleResetFilters = () => {
    setFilterContractStatValue("000");
    setFilterContractTypeValue("000");
    setSearchCategory("전체");
    setSearchText("");
    setBackspaceUsed(false);
    setCurrentPage(1);
    setIsBulkMode(false);
    setFilterStartDate("");
    setFilterEndDate("");
    setSelectedIds([]); // 모드 변경 시 선택 초기화
  };
  /*(1/5)↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑*/


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
  };
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
                  ＊ 거래 유형
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
              {/*(2/5)↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓*/}
              <div className="flex flex-col justify-start h-fit">
                <Label className="h-fit text-xs font-semibold">＊ 시작일</Label>
                <Input
                  type="date"
                  value={isValidDate(filterStartDate) ? filterStartDate : ""}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  onFocus={(e) => e.target.showPicker && e.target.showPicker()} // 💥
                  className="pl-2 pr-2 ml-0 w-[130px] max-h-9 text-xs"
                  onKeyDown={(e) => {
                    const allowed = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "Backspace", "ArrowLeft", "ArrowRight"];
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
                    const allowed = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "Backspace", "ArrowLeft", "ArrowRight"];
                    if (!allowed.includes(e.key)) {
                      e.preventDefault(); // 숫자와 하이픈 외 입력 차단
                    }
                  }}
                />
              </div>
              {/*(2/5)↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑*/}
              {/*(3/5)↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓*/}
              <div className="flex flex-row gap-2">
                <div className="flex flex-col-reverse justify-start mb-3">
                  <button
                    onClick={handleResetFilters}
                    className="w-[70px] text-xs text-amber-800 border border-amber-800 rounded px-3 py-1 hover:text-amber-600 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-gray-800"
                  >
                    초기화
                  </button>
                </div>
                <div className="flex flex-col-reverse justify-start mb-3">
                  <button
                    onClick={handleToggleBulkMode}
                    className="w-[70px] text-xs text-amber-800 border border-amber-800 rounded px-3 py-1 hover:text-amber-600 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-gray-800"
                  >
                    {isBulkMode ? "취소" : "일괄"}
                  </button>
                </div>
                {isBulkMode && (
                  <div className="flex flex-col-reverse justify-start mb-3">
                    <button
                      onClick={handleDeleteSelected}
                      className="w-[70px] text-xs text-red-600 border border-red-600 rounded px-3 py-1 hover:text-red-400 hover:border-red-400 hover:bg-red-50 dark:hover:bg-gray-800"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
              {/*(3/5)↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑*/}
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
                  {/*(4/5)↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓*/}
                  <TableCell
                    isHeader
                    className="relative  w-[80px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    {isBulkMode ? (
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Checkbox
                          checked={
                            paginatedList.length > 0 &&
                            paginatedList.every((item) => selectedIds.includes(item.contId))
                          }
                          onChange={handleToggleAllCurrentPage}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    ) : (
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          번호
                        </span>
                      </div>
                    )}
                  </TableCell>
                  {/*(4/5)↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑*/}
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
                      onClick={(e) => {
                        if (e.currentTarget !== e.target) return;

                        console.log("Row 클릭 핸들러");
                        setSelectedContract(proc);
                        setShowModal(true);
                      }}
                      className={
                        "cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5"
                      }
                    >
                      {/*(5/5)↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓*/}
                      <TableCell className="relative px-5 py-4 sm:px-6 text-center">
                        {isBulkMode ? (
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Checkbox
                              checked={selectedIds.includes(proc.contId)}
                              onChange={(checked) => {
                                setSelectedIds((prev) =>
                                  checked
                                    ? [...prev, proc.contId]
                                    : prev.filter((id) => id !== proc.contId)
                                );
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        ) : (
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                              {idx + 1}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      {/*(5/5)↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑*/}
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                          {getContractTypeName(proc.contTypeCode)}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400 h-full">
                        <div
                          title={proc.listingInfo?.lstgAdd}
                          // truncate = overflow-hidden + whitespace-nowrap + text-overflow: ellipsis
                          className="text-gray-500 hover:underline truncate whitespace-nowrap overflow-hidden text-start"
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
      </ComponentCard >
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
