import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import ContractMngStepNavigation from "../components/myOfficeContract/ContractMng/ContractMngStepNavigation";
import ContractsList from "../components/myOfficeContract/ContractMng/ContractsList";
function ContractMng() {
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
        <ContractMngStepNavigation />
        <div className="relative w-full min-h-screen">
          <br />
          <ContractsList />
        </div>
      </motion.div>
    </>
  );
}

export default ContractMng;
