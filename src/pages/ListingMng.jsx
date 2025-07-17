import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import ListingTable from "../components/myOfficeListing/ListingTable";
import ListingDetails from "../components/myOfficeListing/ListingDetails";
import Drawer from "../components/Drawer";
import { useSecureAxios } from "../hooks/useSecureAxios";
import ListingFilterBar from "../components/myOfficeListing/ListingFilterBar";
import ListingNew from "./ListingNew"; // 상품 등록 컴포넌트 추가

export default function ListingMngWithTransition() {
  const [selectedLstgId, setSelectedLstgId] = useState(null);
  const [listingTypeCodes, setListingTypeCodes] = useState([]);
  const [listingDetailTypeCodes, setListingDetailTypeCodes] = useState([]);
  const [typeSaleCodes, setTypeSaleCodes] = useState([]);
  const [prodStatCodes, setProdStatCodes] = useState([]);
  const [lstgList, setLstgList] = useState([]);
  const [step, setStep] = useState("list");
  const [direction, setDirection] = useState("forward");
  const [filterListingTypeValue, setFilterListingTypeValue] = useState("000");
  const [filterTypeSaleValue, setFilterTypeSaleValue] = useState("000");
  const [filterProdStatValue, setFilterProdStatValue] = useState("000");
  const [searchCategory, setSearchCategory] = useState("전체");
  const [searchText, setSearchText] = useState('');
  const [backspaceUsed, setBackspaceUsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const axios = useSecureAxios();

  useEffect(() => {
    axios.post("/form", {
      codeGroup: {
        listingType: "LSTG1",
        typeSale: "TRDST",
        listingDetailType: "LSTG2",
        prodStat: "PRDST"
      },
    })
      .then(data => {
        setListingTypeCodes(data.listingType.map(item => ({ value: item.codeValue, label: item.codeName })));
        setTypeSaleCodes(data.typeSale.map(item => ({ value: item.codeValue, label: item.codeName })));
        setListingDetailTypeCodes(data.listingDetailType.map(item => ({ value: item.codeValue, label: item.codeName })));
        setProdStatCodes(data.prodStat.map(item => ({ value: item.codeValue, label: item.codeName })));
      })
      .catch(err => console.error("공통코드 로딩 실패", err));

    axios.get("/lstg/list")
      .then(data => {
        data.forEach((lstg, idx) => lstg["indexNo"] = idx + 1);
        setLstgList(data);
      })
      .catch(error => console.error("'lstgList' loading failed", error));
  }, []);

  const filteredList = useMemo(() => {
    const trimmedSearch = searchText.trim().toLowerCase();
    return lstgList.filter(lstg => {
      if (filterListingTypeValue !== "000" && String(lstg.lstgTypeCode1).trim() !== filterListingTypeValue) return false;
      if (filterTypeSaleValue !== "000" && String(lstg.lstgTypeSale).trim() !== filterTypeSaleValue) return false;
      if (filterProdStatValue !== "000" && String(lstg.lstgProdStat).trim() !== filterProdStatValue) return false;
      if (!trimmedSearch || (backspaceUsed && !trimmedSearch)) return true;
      if (searchCategory === '전체') {
        return (
          (lstg.lstgNm || "").toLowerCase().includes(trimmedSearch) ||
          (lstg.tenancyInfo?.mbrNm || "").toLowerCase().includes(trimmedSearch) ||
          (lstg.lstgAdd || "").toLowerCase().includes(trimmedSearch)
        );
      }
      const value = (() => {
        switch (searchCategory) {
          case '매물명': return lstg.lstgNm || '';
          case '임대인': return lstg.tenancyInfo?.mbrNm || '';
          case '주소': return lstg.lstgAdd || '';
          default: return '';
        }
      })();
      return value.toLowerCase().includes(trimmedSearch);
    });
  }, [lstgList, searchCategory, searchText, backspaceUsed, filterListingTypeValue, filterTypeSaleValue, filterProdStatValue]);

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const getListingTypeName = code => listingTypeCodes.find(c => c.value === code)?.label || "기타";
  const getTypeSaleCodeName = code => typeSaleCodes.find(c => c.value === code)?.label || "기타";
  const getListingDetailTypeName = code => listingDetailTypeCodes.find(c => c.value === code)?.label || "기타";
  const getProdStatCodesName = code => prodStatCodes.find(c => c.value === code)?.label || "기타";

  const handleNext = () => {
    const idx = lstgList.findIndex(l => l.lstgId === selectedLstgId);
    if (idx < lstgList.length - 1) setSelectedLstgId(lstgList[idx + 1].lstgId);
  };
  const handlePrev = () => {
    const idx = lstgList.findIndex(l => l.lstgId === selectedLstgId);
    if (idx > 0) setSelectedLstgId(lstgList[idx - 1].lstgId);
  };

  const variants = {
    initial: direction => ({ x: direction === "forward" ? "100%" : "-100%", opacity: 0, position: "absolute", width: "100%" }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeInOut" } },
    exit: direction => ({ x: direction === "forward" ? "-100%" : "100%", opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } }),
  };

  return (
    <div className="relative w-full min-h-screen">
      <PageBreadcrumb pageTitle="매물 관리" />
      <AnimatePresence custom={direction} mode="wait">
        {step === "list" && (
          <motion.div
            key="list"
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <ComponentCard>
              <ListingFilterBar
                filterListingTypeValue={filterListingTypeValue}
                filterTypeSaleValue={filterTypeSaleValue}
                filterProdStatValue={filterProdStatValue}
                searchCategory={searchCategory}
                searchText={searchText}
                listingTypeOptions={listingTypeCodes}
                typeSaleOptions={typeSaleCodes}
                prodStatOptions={prodStatCodes}
                setFilterListingTypeValue={setFilterListingTypeValue}
                setFilterTypeSaleValue={setFilterTypeSaleValue}
                setFilterProdStatValue={setFilterProdStatValue}
                setSearchCategory={setSearchCategory}
                setSearchText={setSearchText}
                handleResetFilters={() => {
                  setFilterListingTypeValue("000");
                  setFilterTypeSaleValue("000");
                  setFilterProdStatValue("000");
                  setSearchCategory("전체");
                  setSearchText("");
                  setBackspaceUsed(false);
                  setCurrentPage(1);
                }}
              />
              <ListingTable
                lstgList={paginatedList}
                onSelectListing={setSelectedLstgId}
                getListingTypeName={getListingTypeName}
                getTypeSaleCodeName={getTypeSaleCodeName}
                getProdStatCodesName={getProdStatCodesName}
              />
              <div className="flex flex-row justify-center gap-2 pt-4">
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
              <div className="flex justify-end w-full pt-4 pr-2">
                <button
                  className="bg-[#BC6B2C] text-white px-5 py-2 rounded hover:bg-[#A25720] transition"
                  onClick={() => {
                    setDirection("forward");
                    setStep("new");
                  }}
                >
                  상품 등록
                </button>
              </div>
            </ComponentCard>
            <Drawer isOpen={!!selectedLstgId} onClose={() => setSelectedLstgId(null)}>
              {selectedLstgId && (
                <ListingDetails
                  lstgId={selectedLstgId}
                  getListingTypeName={getListingTypeName}
                  getTypeSaleCodeName={getTypeSaleCodeName}
                  getProdStatCodesName={getProdStatCodesName}
                  getListingDetailTypeName={getListingDetailTypeName}
                  onNext={handleNext}
                  onPrev={handlePrev}
                  currentIndex={lstgList.findIndex(l => l.lstgId === selectedLstgId)}
                  totalCount={lstgList.length}
                />
              )}
            </Drawer>
          </motion.div>
        )}

        {step === "new" && (
          <motion.div
            key="new"
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <ListingNew onBack={() => {
              setDirection("backward");
              setStep("list");
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}