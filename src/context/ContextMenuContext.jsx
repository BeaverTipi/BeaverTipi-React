import { createContext, useContext, useState } from "react";

const ContextMenuContext = createContext();

export const ContextMenuProvider = ({ children }) => {
  const [contextMenu, setContextMenu] = useState(null);

  return (
    <ContextMenuContext.Provider value={{ contextMenu, setContextMenu }}>
      {children}
    </ContextMenuContext.Provider>
  );
};

export const useContextMenu = () => useContext(ContextMenuContext);
