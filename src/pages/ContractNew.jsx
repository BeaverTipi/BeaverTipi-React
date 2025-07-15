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
import { useSecureAxios } from "../hooks/useSecureAxios.js";
import ContractListingSelect from "../components/myOfficeContract/contractNew/ContractListingSelect";
import AddTenancy from "../components/myOfficeContract/contractNew/AddTenancy.jsx";
import AddLessee from "../components/myOfficeContract/contractNew/AddLessee";
import ContractSampleSelect from "../components/myOfficeContract/contractNew/ContractSampleSelect";
import ContractWriterForm from "../components/myOfficeContract/contractNew/ContractWriterForm";
import ContractPreview from "../components/myOfficeContract/contractNew/ContractPreview.jsx";
import NewContractInfoLayout from "../components/myOfficeContract/contractNew/NewContractInfoLayout.jsx";
import ContractNewStepNavigation from "../components/myOfficeContract/contractNew/ContractNewStepNavigation.jsx";
import { fillPdfStandardLeaseFormWithFormData } from "../components/ContractSample/StandardLeaseForm/fillPdfStandardLeaseForm";
import pdfTemplate from "../components/ContractSample/표준임대차계약서.pdf"; // Vite/Webpack 설정에 따라 import 방식 다를 수 있음

const STEP = {
  SELECT: "select",
  ADD_TENANCY: "add-tenancy",
  ADD_LESSEE: "add-lessee",
  SAMPLE_SELECT: "sample-select",
  SAMPLE_WRITE: "write",
  PDF_PREVIEW: "pdf-preview",
  CONTRACT: "contract",
};
const contractInfoReset = {
  listing: null,
  broker: null,
  tenancy: { 0: {} },
  lessee: null,
  sampleId: null,
  form: null,
  files: null,
};
function ContractNew() {
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [contractInfo, setContractInfo] = useState(contractInfoReset);
  const [contractFileWritten, setContractFileWritten] = useState(null);
  const [step, setStep] = useState(STEP.SELECT);
  const [stepHistory, setStepHistory] = useState([]);
  const [direction, setDirection] = useState("forward");
  const [tenancyNo, setTenancyNo] = useState(0);

  const secureAxios = useSecureAxios();
  useEffect(() => {
    if (step === STEP.SELECT) {
      setIsFirstRender(false);
    }
  }, [step]);

  const generatePdfFromForm = async (formData) => {
    const response = await secureAxios.post("/rest/contract/pdf", formData, {
      responseType: "blob",
    });
    return new File([response.data], "contract-preview.pdf", {
      type: "application/pdf",
    });
  };

  const goToStep = (nextStep) => {
    setStepHistory((prev) => [...prev, step]); // 현재 단계 저장
    setDirection("forward");
    setStep(nextStep);
  };

  const handleListingSaved = (selectedListing) => {
    setContractInfo(contractInfoReset);
    setContractInfo((prev) => ({
      ...prev,
      listing: selectedListing,
      broker: selectedListing.brokerInfo,
      tenancy: { 0: selectedListing.tenancyInfo },
      lstgId: selectedListing.lstgId,
      contTypeCode1: selectedListing.contTypeCode1,
      deposit: selectedListing.lstgLease ? selectedListing.lstgLease : selectedListing.lstgLeaseAmt,
      depositM: selectedListing.lstgLeaseM,
    }));
    if (!selectedListing.tenancyInfo) {
      goToStep(STEP.ADD_TENANCY);
    } else {
      goToStep(STEP.ADD_LESSEE);
    }
  };

  const handleTenancySaved = (TenancyInfo) => {
    setContractInfo((prev) => ({
      ...prev,
      tenancy: TenancyInfo,
    }));
    goToStep(STEP.ADD_LESSEE);
  };

  const handleLesseeSaved = (lesseeInfo) => {
    setContractInfo((prev) => ({
      ...prev,
      lessee: lesseeInfo,
      lesseeCd: lesseeInfo.mbrCd,
    }));
    goToStep(STEP.SAMPLE_SELECT);
  };

  const handleContractSampleSelected = (sampleId) => {
    setContractInfo((prev) => ({
      ...prev,
      sampleId,
    }));
    goToStep(STEP.SAMPLE_WRITE);
  };

  const handleContractSampleWritten = (formData) => {
    setContractInfo((prev) => ({
      ...prev,
      form: formData,
    }));

    goToStep(STEP.PDF_PREVIEW);
  };

  const handleContractPreviewConfirmed = (pdfFile) => {
    setContractInfo((prev) => ({
      ...prev,
      confirmedAt: new Date(), // ✅ 확인 시간 추가 등 가능
    }));
    setContractFileWritten(pdfFile);
    goToStep(STEP.CONTRACT);
  };

  const handleFilesUploaded = (files) => {
    setContractInfo((prev) => ({
      ...prev,
      files,
    }));
  };

  const handleBack = () => {
    if (stepHistory.length > 0) {
      const prevStep = stepHistory[stepHistory.length - 1];
      setStepHistory((prev) => prev.slice(0, -1)); // pop
      setDirection("backward");
      setStep(prevStep);
    }
  };

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
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // 부드럽게 최상단으로 스크롤
  }, [step]);

  return (
    <>
      <ContractNewStepNavigation step={step} STEP={STEP} />
      <div className="relative w-full min-h-screen">
        {" "}
        {/* 브라우저 높이 기준으로 스크롤 */}
        <AnimatePresence custom={direction} mode="wait">
          {step === STEP.SELECT && (
            isFirstRender ? (
              <div key="select" className="w-full">
                <ContractListingSelect
                  onSave={handleListingSaved}
                  contractInfo={contractInfo}
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
                  contractInfo={contractInfo}
                />
              </motion.div>
            )
          )}

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
                tenancy={contractInfo.tenancy}
                onSave={handleTenancySaved}
                onBack={handleBack}
                contractInfo={contractInfo}
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
                lessee={contractInfo.lessee}
                lstgId={contractInfo.listing?.lstgId}
                onSave={handleLesseeSaved}
                onBack={handleBack}
                contractInfo={contractInfo}
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
                onNext={handleContractSampleSelected}
                onBack={handleBack}
                contractInfo={contractInfo}
              />
            </motion.div>
          )}

          {step === STEP.SAMPLE_WRITE && contractInfo.sampleId && (
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
                sampleId={contractInfo.sampleId}
                onSave={handleContractSampleWritten}
                onBack={handleBack}
                contractInfo={contractInfo}
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
                formData={contractInfo.form}
                onConfirm={handleContractPreviewConfirmed}
                onBack={handleBack}
                contractInfo={contractInfo}
                onExtract={(file) => setContractFileWritten(file)}
              />
            </motion.div>
          )}

          {step === STEP.CONTRACT && (
            <motion.div
              key="contract"
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <NewContractInfoLayout
                contractInfo={contractInfo}
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
