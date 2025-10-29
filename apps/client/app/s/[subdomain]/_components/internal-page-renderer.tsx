"use client";
import { FontFamily, PageHeaderWithoutEditor, useEditorContext, usePublicAuth } from "@tribe-nest/frontend-shared";
import { fontMap } from "./fonts";
import { useEffect, useRef } from "react";
import { ArrowLeftIcon } from "lucide-react";

type Props = {
  children: React.ReactNode;
  pageTitle?: string;
  pagePathname?: string;
  backPathname?: string;
  onBack?: () => void;
};

export function InternalPageRenderer({ children, pageTitle, pagePathname, backPathname, onBack }: Props) {
  const { themeSettings, trackEvent, navigate } = useEditorContext();
  const { isInitialized } = usePublicAuth();
  const isPageViewTracked = useRef(false);
  const font = fontMap[themeSettings.fontFamily as keyof typeof fontMap];

  useEffect(() => {
    if (isPageViewTracked.current) {
      return;
    }
    if (trackEvent) {
      isPageViewTracked.current = true;
      trackEvent?.("page_view", {
        pathname: pagePathname,
        pageTitle: pageTitle,
      });
    }
  }, [trackEvent, pagePathname, pageTitle]);

  if (!isInitialized) {
    return null;
  }

  return (
    <div
      className="w-full min-h-screen h-auto"
      style={{
        backgroundColor: themeSettings.colors.background,
        fontFamily: font?.style?.fontFamily || FontFamily.Inter,
      }}
    >
      <PageHeaderWithoutEditor hasBorder={true} />
      {(backPathname || onBack) && (
        <div className="p-4">
          <ArrowLeftIcon
            onClick={() => {
              if (backPathname) {
                navigate(backPathname);
              }
              if (onBack) {
                onBack();
              }
            }}
            className="w-10 h-10 hover:scale-110 transition-all duration-200 cursor-pointer"
            color={themeSettings.colors.primary}
          />
        </div>
      )}
      {children}
    </div>
  );
}

export default InternalPageRenderer;
