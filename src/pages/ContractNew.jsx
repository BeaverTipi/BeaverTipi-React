/*
ContractNew.jsx (최상위)
│
├── STEP.SELECT
│   └── ContractListingSelect
│
├── STEP.ADD_TENANCY
│   └── AddTenancy
│
├── STEP.ADD_LESSEE
│   └── AddLessee
│
├── STEP.SAMPLE_SELECT
│   └── ContractSampleSelect
│
├── STEP.SAMPLE_WRITE
│   └── ContractWriterForm
│       └── StandardLeaseForm.jsx (sampleId 기준 렌더링)
│           ├── HousingContractForm
│           ├── ContractTermsSection
│           ├── ContractLawSection
│           ├── ContractSpecialTerms
│           ├── ContractSignSection
│
├── STEP.PDF_PREVIEW
│   └── ContractPreview (→ ContractPDFRenderer 내부 사용)
│
└── STEP.CONTRACT
    └── ContractTermsForm
        ├── ContractPartyLoader
        ├── ContractFileUpLoader
        └── ContractPDFLoader
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ContractListingSelect from "../components/myOfficeContract/contractNew/ContractListingSelect";
import AddTenancy from "../components/myOfficeContract/contractNew/AddTenancy.jsx";
import AddLessee from "../components/myOfficeContract/contractNew/AddLessee";
import ContractSampleSelect from "../components/myOfficeContract/contractNew/ContractSampleSelect";
import ContractWriterForm from "../components/myOfficeContract/contractNew/ContractWriterForm";
import ContractPreview from "../components/myOfficeContract/contractNew/ContractPreview.jsx";
import NewContractInfoLayout from "../components/myOfficeContract/contractNew/NewContractInfoLayout.jsx";
import ContractNewStepNavigation from "../components/myOfficeContract/contractNew/ContractNewStepNavigation.jsx";
import { useContractInfo } from "../context/ContractInfoContext";

const STEP = {
  SELECT: "select",
  ADD_TENANCY: "add-tenancy",
  ADD_LESSEE: "add-lessee",
  SAMPLE_SELECT: "sample-select",
  SAMPLE_WRITE: "write",
  PDF_PREVIEW: "pdf-preview",
  CONTRACT: "contract",
};

function ContractNew() {
  const [isFirstRender, setIsFirstRender] = useState(true);
  // const [contractInfo, setContractInfo] = useState(contractInfoReset);
  const [contractFileWritten, setContractFileWritten] = useState(null);
  const [step, setStep] = useState(STEP.SELECT);
  const [stepHistory, setStepHistory] = useState([]);
  const [direction, setDirection] = useState("forward");
  const [tenancyNo, setTenancyNo] = useState(1);
  const {
    contractInfo
    , setContractInfo
    , updateListingInfo
    , updateLessorInfo
    , updateLesseeInfo
    , updateSampleId
    , updateWrittenInfo
    , updateAttachedFiles
  } = useContractInfo();
  const contractInfoReset = {
    files: null,
  };

  useEffect(() => {
    //컴포넌트 전환 애니메이션 STEP
    if (step === STEP.SELECT) {
      setIsFirstRender(false);
    }
  }, [step]);

  useEffect(() => {
    // 부드럽게 최상단으로 스크롤
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const goToStep = (nextStep) => {
    setStepHistory((prev) => [...prev, step]);
    setDirection("forward");
    setStep(nextStep);
  };

  const handleListingSaved = (selectedListing) => {
    //최초 단계를 재수행할 시, 기록된 정보 모두 초기화
    setContractInfo(contractInfoReset);
    updateListingInfo(selectedListing);
    // if (!selectedListing.tenancyInfo) goToStep(STEP.ADD_TENANCY);
    // else goToStep(STEP.ADD_LESSEE);
    goToStep(STEP.ADD_TENANCY);
    console.log(`%c[전환]`, "color:yellow; font-weight:bold;", contractInfo);
  };

  const handleTenancySaved = (tenancyInfo) => {
    goToStep(STEP.ADD_LESSEE);
    updateLessorInfo(tenancyInfo)
    console.log(`%c[전환]`, "color:yellow; font-weight:bold;", contractInfo);
  };
  useEffect(() => {
    if (contractInfo?.lessorInfo) {
      console.log(
        `%c[전환 후 상태확인]`, "color:yellow; font-weight:bold;",
        contractInfo.lessorInfo);
    }
  }, [contractInfo.lessorInfo]);

  const handleLesseeSaved = (lesseeInfo) => {
    updateLesseeInfo(lesseeInfo)
    goToStep(STEP.SAMPLE_SELECT);
  };
  useEffect(() => {
    if (contractInfo?.lesseeInfo) {
      console.log(
        `%c[전환 후 상태확인]`, "color:yellow; font-weight:bold;",
        contractInfo.lesseeInfo);
    }
  }, [contractInfo.lesseeInfo]);

  const handleSampleIdSaved = (sampleId) => {
    updateSampleId(sampleId);
    setTimeout(() => {
      goToStep(STEP.SAMPLE_WRITE);
      console.log(`%c[전환]`, "color:yellow; font-weight:bold;", contractInfo);
    }, 0);

  };

  const handleWrittenSaved = contract => {
    updateWrittenInfo(contract);
    goToStep(STEP.PDF_PREVIEW);
    console.log(`%c[전환]`, "color:yellow; font-weight:bold;", contractInfo);
  };

  const handlePreviewSaved = (pdfFile) => {
    setContractInfo((prev) => ({
      ...prev,
      confirmedAt: new Date(), // ✅ 확인 시간 추가 등 가능
    }));
    setContractFileWritten(pdfFile);
    goToStep(STEP.CONTRACT);
    console.log(`%c[전환]`, "color:yellow; font-weight:bold;", contractInfo);
  };

  const handleFilesUploaded = (files) => {
    updateAttachedFiles(files);
  };

  const handleBack = () => {
    if (stepHistory.length > 0) {
      const prevStep = stepHistory[stepHistory.length - 1];
      setStepHistory((prev) => prev.slice(0, -1)); // pop
      setDirection("backward");
      setStep(prevStep);
    }
  };

  //애니메이션 설정
  const variants = {
    initial: (direction) => ({
      x: direction === "forward" ? "100%" : "-100%",
      opacity: 0,
      position: "absolute",
      width: "100%",
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeInOut" },
    },
    exit: (direction) => ({
      x: direction === "forward" ? "-100%" : "100%",
      opacity: 0,
      transition: { duration: 0.4, ease: "easeInOut" },
    }),
  };
  const fadeVariants = {
    initial: {
      opacity: 0,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };
  return (
    <>
      <motion.div
        key={`nav-${step}`}
        initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
        animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
        exit={{ clipPath: "inset(0 100% 0 0)" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <ContractNewStepNavigation step={step} STEP={STEP} />
      </motion.div >
      <div className="relative w-full min-h-screen">
        {/* 브라우저 높이 기준으로 스크롤 */}
        <AnimatePresence custom={direction} mode="wait">
          {step === STEP.SELECT &&
            (isFirstRender ? (
              <div key="select" className="w-full">
                <ContractListingSelect
                  onSave={handleListingSaved}
                />
              </div>
            ) : (
              <motion.div
                key="select"
                custom={direction}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full"
              >
                <ContractListingSelect
                  onSave={handleListingSaved}
                />
              </motion.div>
            ))}

          {step === STEP.ADD_TENANCY && (
            <motion.div
              key="add-tenancy"
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <AddTenancy
                lessor={contractInfo.lessorInfo || {}}
                onSave={handleTenancySaved}
                onBack={handleBack}
                tenancyNo={tenancyNo}
                setTenancyNo={setTenancyNo}
              />
            </motion.div>
          )}

          {step === STEP.ADD_LESSEE && (
            <motion.div
              key="add-lessee"
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <AddLessee
                lessee={contractInfo.lesseeInfo || {}}
                lstgId={contractInfo.listingInfo?.lstgId || ""}
                onSave={handleLesseeSaved}
                onBack={handleBack}
              />
            </motion.div>
          )}

          {step === STEP.SAMPLE_SELECT && (
            <motion.div
              key="sample-select"
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <ContractSampleSelect
                onNext={handleSampleIdSaved}
                onBack={handleBack}
              />
            </motion.div>
          )}

          {step === STEP.SAMPLE_WRITE /*&& contractInfo.sampleId*/ && (
            <motion.div
              key="sample-write"
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <ContractWriterForm
                onSave={handleWrittenSaved}
                onBack={handleBack}
              />
            </motion.div>
          )}

          {step === STEP.PDF_PREVIEW && (
            <motion.div
              key="pdf-preview"
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <ContractPreview
                onConfirm={handlePreviewSaved}
                onBack={handleBack}
                onExtract={(file) => setContractFileWritten(file)}
              />
            </motion.div>
          )}

          {step === STEP.CONTRACT && (
            <motion.div
              key="contract"
              custom={direction}
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <NewContractInfoLayout
                onFilesUploaded={handleFilesUploaded}
                onBack={handleBack}
                attachedFile={contractFileWritten}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default ContractNew;
