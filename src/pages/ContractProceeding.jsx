import React from "react";
import ProceedingContracts from "../components/myOfficeContract/contractProceeding/ProceedingContracts";
import ContractProceedingStepNavigation from "../components/myOfficeContract/contractProceeding/ContractProceedingStepNavigation";
import { AnimatePresence, motion } from "framer-motion";
function ContractProceeding() {
  return (
    <>
      <motion.div
        key="nav"
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="w-full"
      >
        <ContractProceedingStepNavigation />
        <div className="relative w-full min-h-screen">
          <br />
          <ProceedingContracts />
        </div>
      </motion.div>
    </>
  );
}

export default ContractProceeding;
