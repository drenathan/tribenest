import { createContext, useContext, useState } from "react";

type AppConfig = {
  isSelfHosted: boolean;
  isMultiTenant: boolean;
};

type AppConfigContextType = {
  appConfig: AppConfig;
  setAppConfig: (appConfig: AppConfig) => void;
};
const AppConfigContext = createContext<AppConfigContextType | null>(null);

export const AppConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [appConfig, setAppConfig] = useState<AppConfig>({
    isSelfHosted: true,
    isMultiTenant: false,
  });

  return <AppConfigContext.Provider value={{ appConfig, setAppConfig }}>{children}</AppConfigContext.Provider>;
};

export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error("useAppConfig must be used within an AppConfigProvider");
  }
  return context;
};
