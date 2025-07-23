import React, { useContext } from "react";
import { createContext } from "react";

type SelectorContextType = {
  isRenderMode: boolean;
};

const SelectorContext = createContext<SelectorContextType>({
  isRenderMode: false,
});

export const SelectorProvider = ({ children, isRenderMode }: { children: React.ReactNode; isRenderMode: boolean }) => {
  return <SelectorContext.Provider value={{ isRenderMode }}>{children}</SelectorContext.Provider>;
};

export const useSelectorContext = () => {
  return useContext(SelectorContext);
};
