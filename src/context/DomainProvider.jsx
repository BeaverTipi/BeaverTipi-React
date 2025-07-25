import React, { useMemo } from "react";
import { DomainContext } from "./DomainContext";

export const DomainProvider = ({ prefix = "", children }) => {
  const PROTOCOL = window.location.protocol;
  let HOSTNAME = window.location.hostname;

  const domainMap = {
    "react.beavertipi.com": "beavertipi.com",
    "dev.beavertipi.com": "dev1.beavertipi.com",
    "hbdev.beavertipi.com": "hbdev1.beavertipi.com",
  };

  HOSTNAME = domainMap[HOSTNAME] || HOSTNAME;
  const SPRING_URL_ORIGIN = `${window.location.protocol}//${domainMap[window.location.hostname] || window.location.hostname}`;
  const SPRING_URL_PREFIX = prefix || "/rest/broker/myoffice";

  const contextValue = useMemo(() => ({
    SPRING_URL_ORIGIN,
    SPRING_URL_PREFIX,
    HOSTNAME
  }), [SPRING_URL_ORIGIN, SPRING_URL_PREFIX, HOSTNAME]);

  return (
    <DomainContext.Provider value={contextValue}>
      {children}
    </DomainContext.Provider>
  );
};
