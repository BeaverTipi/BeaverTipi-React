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
import "react-datepicker/dist/react-datepicker.css";
import { useDomain } from "../../../hooks/useDomain";
import { useSecureAxiosFactory } from "../../../hooks/useSecureAxiosFactory";
import { getKSTDate } from "../../../js/getKSTDate";
function ProceedingContracts() {
  console.log("🌐 DOMAIN:", useDomain());

  const navigate = useNavigate();
  const axios = useSecureAxios();
  const createSecureAxios = useSecureAxiosFactory({
    maxAgeMs: 300_000,
    retryCount: 2,
  });
  const authAxios = createSecureAxios("/rest/contract");
  const { encrypt, decrypt, encodeURI, decodeURI } = useAES256();
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
  const [clickedRowId, setClickedRowId] = useState(null);
  const { SPRING_URL_ORIGIN } = useDomain();

  useEffect(() => {
    if (clickedRowId !== null) {
      const timer = setTimeout(() => {
        setClickedRowId(null);
      }, 2500);

      return () => clearTimeout(timer); // 💡 컴포넌트 언마운트나 clickedRowId 재변경 시 클린업
    }
  }, [clickedRowId]);

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
        title: "안내",
        text: "선택된 계약이 없습니다.",
        icon: "info",
        timer: 1500,
        showConfirmButton: false,
        scrollbarPadding: false,
      });
    }
    const confirmed = await Swal.fire({
      title: "삭제 확인",
      text: `${selectedIds.length}건의 계약을 삭제하시겠습니까?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "삭제하기",
      cancelButtonText: "취소",
      scrollbarPadding: false,
    });
    if (!confirmed.isConfirmed) return;

    try {
      await axios
        .post("cont/proc/delete", {
          selectedContracts: selectedIds,
          _method: "DELETE",
        })
        .then((data) => console.log(data));
      setProcContracts((prev) => {
        const updated = prev.filter((c) => !selectedIds.includes(c.contId));
        const newTotalPages = Math.ceil(updated.length / itemsPerPage);
        // 현재 페이지가 사라졌다면 이전 페이지로 이동
        if (currentPage > newTotalPages)
          setCurrentPage(Math.max(1, newTotalPages));
        return updated;
      });
      setSelectedIds([]);
      setIsBulkMode(false); // ✅ 성공시에만 종료

      Swal.fire({
        title: "삭제 완료",
        text: "선택한 계약이 삭제되었습니다.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        scrollbarPadding: false,
      });
    } catch (err) {
      console.error("삭제 오류:", err);
      Swal.fire({
        title: "삭제 실패",
        text: "삭제 중 오류가 발생했습니다.",
        icon: "error", // ✅ 수정됨
        timer: 1500,
        showConfirmButton: false,
        scrollbarPadding: false,
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
  console.log("KSTDATE::", getKSTDate().toISOString());
  const handleResetFilters = () => {
    setFilterContractStatValue("000");
    setFilterContractTypeValue("000");
    setSearchCategory("전체");
    setSearchText("");
    setBackspaceUsed(false);
    setCurrentPage(1);
    setIsBulkMode(false);
    setFilterStartDate("");
    setFilterEndDate(() => {
      const now = new Date();
      return now.toISOString().split("T")[0]; // 예: "2025-07-21"
    });
    setSelectedIds([]); // 모드 변경 시 선택 초기화
    setClickedRowId(null);
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
        console.log(contrOpt, trdstOpt);
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
          "color:gray; font-weight:bold",
          procContracts
        )
      );

    if (hasShownModal || !procContracts) return;
    const localStorageKey = encrypt("NEXT_PROCEEDING-CONTRACT");
    const localStorageValue = localStorage.getItem(localStorageKey);
    const contractId =
      localStorageValue !== null ? decrypt(localStorageValue) : "";
    console.log("12094urfc932u", contractId);
    if (!contractId || !procContracts) return;
    if (contractId && procContracts && procContracts.length > 0) {
      const matchedContract = procContracts.find(
        (c) => c.contId === contractId
      );

      if (matchedContract) {
        setSelectedContract(matchedContract);
        setShowModal(true);
        localStorage.removeItem(localStorageKey);
      }
    }
  }, []);

  const handleContractSignaturePageNavigate = async (contId) => {
    try {
      // Response data = { success, signYn, message }
      // 1. 서명페이지 개설 여부(유효성) 확인
      const {
        success,
        signYn,
        message: signStatusMsg,
      } = await axios.post(`cont/proc/sign-status`, {
        contId: contId,
        _method: "GET",
      });

      if (!success || signYn === "N") {
        return Swal.fire({
          icon: "info",
          title: "서명페이지가 만료되었습니다",
          text: signStatusMsg || "해당 계약의 서명 유효 시간이 종료되었습니다.",
          confirmButtonColor: "#085D89", // sky-800
          scrollbarPadding: false,
        });
      }

      const encryptedContId = encrypt(contId);
      const encodedEncryptedContId = encodeURI(encryptedContId);
      // 2.인가 요청
      const authData = await authAxios.post("authorize", {
        encryptedContId,
        _method: "GET",
      });
      if (!authData.success) {
        //비로그인 상태 처리
        if (authData.message === "로그인이 필요합니다.")
          return navigate("/signin");

        //기타 인가 실패
        return Swal.fire({
          icon: "info",
          title: "접근 불가",
          text: authData.message || "해당 계약 정보에 접근할 권한이 없습니다.",
        });
      }

      // // 3. 서명페이지 이동
      // window.location.href = `/contract/${encryptedContId}`;
      window.location.href = `/contract/${encodedEncryptedContId}`;
    } catch (err_open) {
      console.error(err_open);
      Swal.fire({
        icon: "error",
        title: "요청 실패",
        text: "계약 상태를 확인하는 데 실패했습니다.",
        scrollbarPadding: false,
      });
    }
  };
  // console.log("Encrypted ID:", encrypt("CN250723002"));

  const handleContractSignaturePageOpen = async (contId) => {
    const contract = procContracts.find((c) => c.contId === contId);
    if (!contract) return;

    const { listingInfo, tenancyInfo, lesseeInfo, contDtm, contTypeCode } =
      contract;
    const result = await Swal.fire({
      title: "계약 개설 확인",
      html: `
        <p style="font-weight: 500; font-size: 14px; margin-bottom: 10px;">
          ⚠️ 전자서명 페이지는 개설 시점부터 <b>10분간 유효</b>하며 ⚠️<br/>
          유효 시간이 지나면 자동으로 만료됩니다.<br/>
          계약자에게 링크를 공유하기 전에 유효 시간을 꼭 확인해 주세요.
        </p>
        <div style="text-align: left; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 10px;">
          <b>매물명:</b> ${listingInfo?.lstgNm || "-"}<br/>
          <b>주소:</b> ${listingInfo?.lstgAdd || "-"}<br/>
          <b>임대인:</b> ${tenancyInfo?.mbrNm || "-"}<br/>
          <b>임차인:</b> ${lesseeInfo?.mbrNm || "-"}<br/>
          <b>계약일시:</b> ${contDtm || "-"}<br/>
          <b>계약유형:</b> ${getContractTypeName(contTypeCode)}
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "서명 페이지 열기",
      cancelButtonText: "취소",
      confirmButtonColor: "#f59e0b", // amber-500
      cancelButtonColor: "#d1d5db", // gray-300
      scrollbarPadding: false,
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: "서명 페이지 개설 중입니다...",
      html: "서버에서 계약을 처리 중입니다.<br/>잠시만 기다려주세요.",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const _data = await axios.post("cont/proc/open-signpage", {
        contId,
        _method: "UPDATE",
      });

      const data = await axios.post("cont/proc/list");
      if (!isEqual(data, procContracts)) setProcContracts(data);

      const result2 = await Swal.fire({
        title: "전자서명 개설 완료",
        text: "서명 페이지가 성공적으로 개설되었습니다. 바로 이동하시겠습니까?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "이동",
        cancelButtonText: "확인",
        confirmButtonColor: "#085D89", // sky-800
        cancelButtonColor: "#d1d5db", // gray-300
        scrollbarPadding: false,
      });

      // if (result2.isConfirmed) window.location.href = `${SPRING_URL_ORIGIN}/contract/${encrypt(contId)}`;
      await handleContractSignaturePageNavigate(contId);
    } catch (err) {
      console.error("서명 페이지 개설 실패", err);
      Swal.fire({
        icon: "error",
        title: "오류 발생",
        text: "서명 페이지 개설에 실패했습니다. 다시 시도해주세요.",
        scrollbarPadding: false,
      });
    }
  };

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:80/ws/contractExpire");

    socket.onopen = () => {
      console.log("✅ WebSocket 연결 성공");
    };

    socket.onmessage = (event) => {
      const msg = event.data;
      if (msg.startsWith("EXPIRED:")) {
        const expiredContId = msg.split(":")[1];
        console.log("📢 계약 만료 감지됨!", expiredContId);

        // 📌 필요한 경우 상태값 갱신
        setProcContracts((prev) =>
          prev.map((c) =>
            c.contId === expiredContId ? { ...c, contSignYn: "N" } : c
          )
        );

        Swal.fire({
          icon: "info",
          title: "서명 페이지 만료됨",
          text: `계약 [${expiredContId}]의 서명 페이지가 만료되었습니다.`,
          confirmButtonColor: "#085D89",
          scrollbarPadding: false,
        });
      }
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket 에러", err);
    };

    socket.onclose = () => {
      console.log("🔌 WebSocket 연결 종료됨");
    };

    return () => {
      socket.close();
    };
  }, []);

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
                            paginatedList.every((item) =>
                              selectedIds.includes(item.contId)
                            )
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
                    className="w-[300px] px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    매물주소
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[200px] px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    매물명
                  </TableCell>

                  <TableCell
                    isHeader
                    className="w-[100px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    임대인
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-[100px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
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
                    className="w-[120px] px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    서명 페이지
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedList && paginatedList.length > 0 ? (
                  paginatedList.map((proc, idx) => (
                    <TableRow
                      key={proc.contId}
                      onClick={(e) => {
                        // if (e.currentTarget !== e.target) return;

                        console.log("Row 클릭 핸들러");
                        setClickedRowId(proc.contId); // 클릭된 Row 기억

                        setSelectedContract(proc);
                        setShowModal(true);
                      }}
                      className={`cursor-pointer ${
                        clickedRowId === proc.contId
                          ? "bg-gray-100 dark:bg-gray-700" // ✅ 클릭된 Row의 고정 배경색
                          : "hover:bg-gray-100 dark:hover:bg-white/5"
                      } transition-colors duration-150`}
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
                          title={
                            proc.listingInfo?.lstgAdd +
                            " " +
                            proc.listingInfo?.lstgAdd2
                          }
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
                          {proc.listingInfo?.lstgAdd}&nbsp;&nbsp;
                          {proc.listingInfo?.lstgAdd2}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400 h-full">
                        <div
                          title={proc.listingInfo?.lstgNm}
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
                          {proc.contSignYn === "N" ? (
                            <button
                              className="w-[50px] text-xs text-amber-800 border border-amber-800 rounded px-3 py-1 hover:text-amber-600 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-gray-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleContractSignaturePageOpen(proc.contId);
                              }}
                            >
                              개설
                            </button>
                          ) : (
                            <button
                              className="w-[50px] text-xs text-sky-800 border border-sky-800 rounded px-3 py-1 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleContractSignaturePageNavigate(
                                  proc.contId
                                ); // 동일한 함수 재사용
                              }}
                            >
                              이동
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center py-4 text-gray-400">
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
                className={`px-3 py-1 rounded ${
                  i + 1 === currentPage
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
