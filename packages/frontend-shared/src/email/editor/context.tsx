"use client";
import type { EditorContextType, EditorTheme, Profile, ThemePage } from "../../types";
import type { AxiosInstance } from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const EditorContext = createContext<EditorContextType>({
  profile: undefined,
  isAdminView: false,
  httpClient: undefined,
  themeName: "",
  navigate: () => {},
  setThemeSettings: () => {},
  currentProductId: undefined,
  setCurrentProductId: undefined,
  pages: [],
  themeSettings: {
    colors: {
      primary: "",
      background: "",
      text: "",
      textPrimary: "",
    },
    cornerRadius: "",
    fontFamily: "",
    logo: "",
    headerLinks: [],
    socialLinks: [],
  },
});

export const EditorContextProvider = ({
  children,
  profile,
  isAdminView,
  httpClient,
  themeSettings: themeSettingsProps,
  navigate,
  pages,
  themeName,
}: {
  children: React.ReactNode;
  profile?: Profile;
  isAdminView: boolean;
  httpClient?: AxiosInstance;
  themeSettings: EditorTheme;
  navigate: (href: string, options?: { replace?: boolean; buttonId?: string }) => void;
  themeName?: string;
  pages: ThemePage[];
}) => {
  const [themeSettings, setThemeSettings] = useState<EditorTheme>(themeSettingsProps);
  const [currentProductId, setCurrentProductId] = useState<string | undefined>("");

  return (
    <EditorContext.Provider
      value={{
        profile,
        isAdminView,
        httpClient,
        themeSettings,
        navigate,
        setThemeSettings,
        pages,
        themeName,
        currentProductId,
        setCurrentProductId,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorContextProvider");
  }
  return context;
};

export const ContainerQueryContext = createContext<{
  width: number;
  matches: {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  };
} | null>(null);

export const useContainerQueryContext = () => {
  const ctx = useContext(ContainerQueryContext);
  if (!ctx) {
    throw new Error("useContainerQueryContext must be used within ContainerQueryProvider");
  }
  return ctx;
};

export function ContainerQueryProvider({
  children,
  ref,
}: {
  children: React.ReactNode;
  ref: React.RefObject<HTMLDivElement | null>;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry?.contentRect.width ?? 0);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  const matches = useMemo(() => {
    return {
      isMobile: width <= 500,
      isTablet: width > 500 && width <= 1024,
      isDesktop: width > 1024,
    };
  }, [width]);

  return <ContainerQueryContext.Provider value={{ width, matches }}>{children}</ContainerQueryContext.Provider>;
}
