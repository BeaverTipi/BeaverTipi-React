import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ContractListingSelect from "../components/myOfficeContract/ContractListingSelect";
import AddNonUserTenancy from "../components/myOfficeContract/AddNonUserTenancy";
import AddLessee from "../components/myOfficeContract/AddLessee";
import ContractTermsForm from "../components/myOfficeContract/ContractTermsForm";

const STEP = {
  SELECT: "select",
  ADD_TENANCY: "add-tenancy",
  ADD_LESSEE: "add-lessee",
  CONTRACT: "contract",
};

function ContractNew() {
  const [selectedListing, setSelectedListing] = useState(null);
  const [step, setStep] = useState(STEP.SELECT);
  const [stepHistory, setStepHistory] = useState([]);
  const [direction, setDirection] = useState("forward");

  const goToStep = nextStep => {
    setStepHistory((prev) => [...prev, step]); // 현재 단계 저장
    setDirection("forward");
    setStep(nextStep);
  };

  const handleSelect = listing => {
    setSelectedListing(listing);
    if (!listing.tenancyInfo) {
      goToStep(STEP.ADD_TENANCY);
    } else {
      goToStep(STEP.ADD_LESSEE);
    }
  };
  const handleTenancySaved = updatedTenancyInfo => {
    setSelectedListing(prev => ({
      ...prev,
      tenancyInfo: updatedTenancyInfo,
    }));
    goToStep(STEP.ADD_LESSEE);
  };

  const handleLesseeSaved = lesseeInfo => {
    setSelectedListing(prev => ({
      ...prev,
      lesseeInfo: lesseeInfo,
    }));
    goToStep(STEP.CONTRACT);
  };

  const handleBack = () => {
    if (stepHistory.length > 0) {
      const prevStep = stepHistory[stepHistory.length - 1];
      setStepHistory(prev => prev.slice(0, -1)); // pop
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
  <div className="relative w-full min-h-screen"> {/* 브라우저 높이 기준으로 스크롤 */}
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
          <ContractListingSelect onSelect={handleSelect} />
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
          <AddNonUserTenancy
            selectedListing={selectedListing}
            onSave={handleTenancySaved}
            onBack={handleBack}
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
            selectedListing={selectedListing}
            onSave={handleLesseeSaved}
            onBack={handleBack}
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
            selectedListing={selectedListing}
            onBack={handleBack}
          />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

}

export default ContractNew;
