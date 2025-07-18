import { createHttpClient } from "@/services/httpClient";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AxiosInstance } from "axios";

type ConfigContext = {
  apiUrl: string;
  rootDomain: string;
  httpClient: AxiosInstance | null;
  setHttpClientToken: (token: string) => void;
};

const ConfigContext = createContext<ConfigContext>({
  apiUrl: "",
  rootDomain: "",
  httpClient: null,
  setHttpClientToken: () => {},
});

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState({
    apiUrl: "",
    rootDomain: "",
  });

  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    fetch(`${origin}/api/config`)
      .then((res) => res.json())
      .then((config) => {
        setConfig({
          apiUrl: config.apiUrl,
          rootDomain: config.rootDomain,
        });
      });
  }, []);

  const httpClient = useMemo(() => {
    return config.apiUrl ? createHttpClient(config.apiUrl) : null;
  }, [config.apiUrl]);

  const setHttpClientToken = (token: string) => {
    if (httpClient) {
      httpClient.defaults.headers.common["authorization"] = `Bearer ${token}`;
    }
  };

  return (
    <ConfigContext.Provider value={{ ...config, httpClient, setHttpClientToken }}>
      {httpClient ? children : <div></div>}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  return useContext(ConfigContext);
};
