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
import ContractListingSelect from "../components/myOfficeContract/ContractListingSelect";
import AddTenancy from "../components/myOfficeContract/AddTenancy.jsx";
import AddLessee from "../components/myOfficeContract/AddLessee";
import ContractTermsForm from "../components/myOfficeContract/ContractTermsForm";
import ContractSampleSelect from "../components/myOfficeContract/ContractSampleSelect";
import ContractWriterForm from "../components/myOfficeContract/ContractWriterForm";
import ContractPartyLoader from "../components/myOfficeContract/ContractPartyLoader";
import ContractPreview from "../components/myOfficeContract/ContractPreview.jsx";
import { useSecureAxios } from "../hooks/useSecureAxios.js";
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
  const contractInfoReset = {
    listing: null,
    broker: null,
    tenancy: { 0: {} },
    lessee: null,
    sampleId: null,
    form: null,
    files: [],
  };
  const [contractInfo, setContractInfo] = useState(contractInfoReset);
  const [step, setStep] = useState(STEP.SELECT);
  const [stepHistory, setStepHistory] = useState([]);
  const [direction, setDirection] = useState("forward");
  const [tenancyNo, setTenancyNo] = useState(0);

  const secureAxios = useSecureAxios();
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

  const handleContractSampleWritten = async (formData) => {
    const file = await generatePdfFromForm(formData); // PDF Blob 만들기
    setContractInfo((prev) => ({
      ...prev,
      form: formData,
      file, // ✅ 여기에 저장
    }));

    goToStep(STEP.PDF_PREVIEW);
  };

  const handleContractPreviewConfirmed = () => {
    setContractInfo((prev) => ({
      ...prev,
      confirmedAt: new Date(), // ✅ 확인 시간 추가 등 가능
    }));
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

  return (
    <div className="relative w-full min-h-screen">
      {" "}
      {/* 브라우저 높이 기준으로 스크롤 */}
      <AnimatePresence custom={direction} mode="wait">
        {step === STEP.SELECT && (
          <motion.div
            key="select"
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full" // ❌ absolute 제거!
          >
            <ContractListingSelect
              onSave={handleListingSaved}
              contractInfo={contractInfo}
            />
          </motion.div>
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
            <ContractTermsForm
              contractInfo={contractInfo}
              onFilesUploaded={handleFilesUploaded}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ContractNew;
