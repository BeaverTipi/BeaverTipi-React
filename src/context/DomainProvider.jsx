import React, { useMemo } from "react";
import { DomainContext } from "./DomainContext";

export const DomainProvider = ({ prefix = "", children }) => {
  const PROTOCOL = window.location.protocol;
  let HOSTNAME = window.location.hostname;

  const domainMap = {
    "react.beavertipi.com": "beavertipi.com",
    "dev.beavertipi.com": "dev1.beavertipi.com",
    "hbdev1.beavertipi.com": "hbdev.beavertipi.com",
  };

  HOSTNAME = domainMap[HOSTNAME] || HOSTNAME;

  const contextValue = useMemo(() => {
    return {
      SPRING_URL_ORIGIN: `${PROTOCOL}//${HOSTNAME}`,
      SPRING_URL_PREFIX: prefix || "/rest/broker/myoffice",
    };
  }, [PROTOCOL, HOSTNAME, prefix]);

  return (
    <DomainContext.Provider value={contextValue}>
      {children}
    </DomainContext.Provider>
  );
};
