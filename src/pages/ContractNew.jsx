import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ContractListingSelect from "../components/myOfficeContract/ContractListingSelect";
import ContractPartyLoader from "../components/myOfficeContract/ContractPartyLoader";
import AddNonUserTenancy from "../components/myOfficeContract/AddNonUserTenancy";
import AddLessee from "../components/myOfficeContract/AddLessee";

const STEP = {
  SELECT: "select"
  , ADD_TENANCY: "add-tenancy"
  , ADD_LESSEE: "add-lessee"
  , CONTRACT: "contract"
};

function ContractNew() {
  const [selectedListing, setSelectedListing] = useState(null);
  const [step, setStep] = useState(STEP.SELECT); // "select", "add-tenancy", "contract"
  const [direction, setDirection] = useState("forward"); // ✅ "forward" or "backward"

  const handleSelect = (listing) => {
    setSelectedListing(listing);
    if (!listing.tenancyInfo) {
      setDirection("forward");
      setStep(STEP.ADD_TENANCY);
    } else {
      setDirection("forward");
      setStep(STEP.CONTRACT);
    }
  };

  const handleTenancySaved = (updatedTenancyInfo) => {
    setSelectedListing(prev => ({
      ...prev,
      tenancyInfo: updatedTenancyInfo
    }));
    setDirection("forward");
    setStep(STEP.ADD_LESSEE);
  };

  const handleLesseeSaved = (lesseeInfo) => {
    console.log("입주자 정보:", lesseeInfo);
    setSelectedListing(prev => ({
      ...prev,
      lesseeInfo: lesseeInfo
    }));
    // 다음 단계로 전환
    setDirection("forward");
    setStep(STEP.CONTRACT);
  };

  const handleBack = () => {
    setDirection("backward"); // ✅ 뒤로 갈 땐 backward
    setStep(STEP.SELECT);
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
    <>
      <div className="relative w-full min-h-[800px] overflow-y-auto overflow-x-hidden">
        <AnimatePresence custom={direction} mode="wait">
          {step === STEP.SELECT && (
            <motion.div key={`add-tenancy-${selectedListing?.lstgId}`} custom={direction} variants={variants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
              <ContractListingSelect onSelect={handleSelect} />
            </motion.div>
          )}
          {step === STEP.ADD_TENANCY && (
            <motion.div key="add-tenancy" custom={direction} variants={variants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
              <AddNonUserTenancy onSave={handleTenancySaved} onBack={handleBack} selectedListing={selectedListing} />
            </motion.div>
          )}
          {step === STEP.CONTRACT && (
            <motion.div key="contract" custom={direction} variants={variants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
              <ContractPartyLoader selectedListing={selectedListing} onBack={handleBack} />
            </motion.div>
          )}
          {step === "add-lessee" && (
            <motion.div key="add-lessee" custom={direction} variants={variants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
              <AddLessee selectedListing={selectedListing} onSave={handleLesseeSaved}
                onBack={() => { setDirection("backward"); setStep("add-tenancy"); }} />
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </>
  );
}

export default ContractNew;
