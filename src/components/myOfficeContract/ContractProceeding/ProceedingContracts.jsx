import React, { useEffect, useMemo, useState } from 'react'
import { useSecureAxios } from '../../../hooks/useSecureAxios';
import ComponentCard from '../../common/ComponentCard';
import Label from '../../form/Label';

function ProceedingContracts() {
  const axios = useSecureAxios();
  const [procContracts, setProcContracts] = useState(null);

  const [contractStatOptions, setContractStatOptions] = useState(null);
  const [contractTypeOptions, setContractTypeOptions] = useState(null);
  const [filterContractStatValue, setFilterContractStatValue] = useState("000");
  const [filterContractTypeValue, setFilterContractTypeValue] = useState("000");
  const [searchCategory, setSearchCategory] = useState("전체");
  const [searchText, setSearchText] = useState('');
  const [backspaceUsed, setBackspaceUsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredList = useMemo(() => {
    const trimmedSearch = searchText.trim().toLowerCase();
    return procContracts?.filter(proc => {
      if (filterContractStatValue !== "000" && proc.contStatCd !== filterContractStatValue) return false;
      if (filterContractTypeValue !== "000" && proc.contTypeCode !== filterContractTypeValue) return false;
      if (!trimmedSearch || (backspaceUsed && !trimmedSearch)) return true;
      if (searchCategory === '전체') {
        return (
          (proc.lstgNm || "").toLowerCase().includes(trimmedSearch) ||
          (proc.tenancyInfo?.mbrNm || "").toLowerCase().includes(trimmedSearch) ||
          (proc.lstgAdd || "").toLowerCase().includes(trimmedSearch)
        );
      }
      // const value = (() => {
      //   switch (searchCategory) {
      //     case '매물명': return proc.listingInfo.lstgNm || '';
      //     case '임대인': return proc.tenancyInfo?.mbrNm || '';
      //     case '주소': return proc.lstgAdd || '';
      //     default: return '';
      //   }
      // })();
      // return value.toLowerCase().includes(trimmedSearch);
      return "";
    });
  }, []);



  useEffect(() => {
    axios.post("form", {
      codeGroup: {
        contractStatList: "CONTR"
        , contractTypeList: "TRDST"
      }
    })
      .then(data => {
        const contrOpt = data.contractStatList.map(contr => ({
          ...contr,
          value: contr.codeValue,
          label: contr.codeName,
        }));
        const trdstOpt = data.contractTypeList.map(trdst => ({
          ...trdst,
          value: trdst.codeValue,
          label: trdst.codeName,
        }));
        setContractStatOptions(contrOpt);
        setContractTypeOptions(trdstOpt);
        console.log(contractStatOptions, contractTypeOptions);
      });

    axios.post("cont/proc/list")
      .then(data => {
        // console.log("proceeding-contracts:: ", data);
        setProcContracts(data);
        console.log(`%c[STATE] procContracts`, "color:yellow; font-weight:bold", procContracts);
      }).then(
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /*
  contAmount
  contDeposit
  contDtm
  contId
  contStatCd
  contStatGroupCd: "CONTR"
  contTaxAmount
  contTypeCode
  contTypeGroupCd: "TRDST"
  lstgId
  mbrCd
  mbrCdBrok
  */


  return (
    <>
      <ComponentCard
        title="📝 진행중인 계약"
      >
        {/* 검색요소
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
        </div> */}



      </ComponentCard>
    </>
  )
}

export default ProceedingContracts