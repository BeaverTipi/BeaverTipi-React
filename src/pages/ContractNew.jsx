import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ContractListingSelect from "../components/myOfficeContract/ContractListingSelect";
import ContractPartyLoader from "../components/myOfficeContract/ContractPartyLoader";
import AddNonUserTenancy from "../components/myOfficeContract/AddNonUserTenancy";


function ContractNew() {
  const [selectedListing, setSelectedListing] = useState(null);
  const [step, setStep] = useState("select"); // "select", "add-tenancy", "contract"
  const [direction, setDirection] = useState("forward"); // ✅ "forward" or "backward"

  const handleSelect = (listing) => {
    setSelectedListing(listing);
    if (!listing.tenancyInfo) {
      setDirection("forward");
      setStep("add-tenancy");
    } else {
      setDirection("forward");
      setStep("contract");
    }
  };


  const handleTenancySaved = (updatedTenancyInfo) => {
    setSelectedListing(prev => ({
      ...prev,
      tenancyInfo: updatedTenancyInfo
    }));
    setDirection("forward");
    setStep("contract");
  };


  const handleBack = () => {
    setDirection("backward"); // ✅ 뒤로 갈 땐 backward
    setStep("select");
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
          {step === "select" && (
            <motion.div key={`add-tenancy-${selectedListing?.lstgId}`} custom={direction} variants={variants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
              <ContractListingSelect onSelect={handleSelect} />
            </motion.div>
          )}
          {step === "add-tenancy" && (
            <motion.div key="add-tenancy" custom={direction} variants={variants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
              <AddNonUserTenancy onSave={handleTenancySaved} onBack={handleBack} selectedListing={selectedListing} />
            </motion.div>
          )}
          {step === "contract" && (
            <motion.div key="contract" custom={direction} variants={variants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
              <ContractPartyLoader selectedListing={selectedListing} onBack={handleBack} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}

export default ContractNew;
