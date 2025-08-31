"use client";
import { PageHeaderWithoutEditor, useEditorContext, usePublicAuth } from "@tribe-nest/frontend-shared";
import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
  pageTitle?: string;
  pagePathname?: string;
};

export function InternalPageRenderer({ children, pageTitle, pagePathname }: Props) {
  const { themeSettings, trackEvent } = useEditorContext();
  const { isInitialized } = usePublicAuth();
  const isPageViewTracked = useRef(false);

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
    <div className="w-full min-h-screen h-auto" style={{ backgroundColor: themeSettings.colors.background }}>
      <PageHeaderWithoutEditor hasBorder={true} />
      {children}
    </div>
  );
}

export default InternalPageRenderer;
