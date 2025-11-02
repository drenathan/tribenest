"use client";

import {
  editorResolver,
  FontFamily,
  RenderNode,
  useEditorContext,
  usePublicAuth,
  websiteThemes,
} from "@tribe-nest/frontend-shared";
import { WebPage } from "../_api";

import { Editor, Frame } from "@craftjs/core";
import { useEffect, useRef } from "react";
import { fontMap } from "./fonts";

export const PageRenderer = ({ webPage, paramId }: { webPage: WebPage; paramId?: string }) => {
  const theme = websiteThemes.find((theme) => theme.slug === webPage.themeName);
  const currentPage = theme?.pages.find((page) => page.pathname === webPage.page.pathname);
  const { isInitialized } = usePublicAuth();
  const { setCurrentProductId, trackEvent } = useEditorContext();
  const isPageViewTracked = useRef(false);

  useEffect(() => {
    if (paramId) {
      switch (webPage.page.pathname) {
        case "/music/:id":
        case "/products/:id":
          setCurrentProductId!(paramId);
          break;
        default:
          break;
      }
    }
  }, [paramId, webPage.page.pathname, setCurrentProductId]);

  useEffect(() => {
    if (isPageViewTracked.current) {
      return;
    }
    if (webPage) {
      isPageViewTracked.current = true;
      trackEvent?.("page_view", {
        pathname: webPage.page.pathname,
        pageTitle: webPage.page.title,
      });
    }
  }, [trackEvent, webPage]);

  if (!isInitialized) {
    return null;
  }

  if (!currentPage || !theme) {
    return <div>Page not found</div>;
  }

  return (
    <Editor
      enabled={false}
      resolver={{ ...editorResolver, page: currentPage.Component, ...theme.editorResolver }}
      onRender={RenderNode}
    >
      <PageContent webPage={webPage} />
    </Editor>
  );
};

const PageContent = ({ webPage }: { webPage: WebPage }) => {
  const selectedFont = webPage.themeSettings.fontFamily;
  const font = fontMap[selectedFont as keyof typeof fontMap];

  return (
    <div
      className={`w-full h-full mx-auto`}
      style={{
        fontFamily: font?.style?.fontFamily || FontFamily.Inter,
        backgroundColor: webPage.themeSettings?.colors?.background,
      }}
    >
      <Frame data={webPage.page.content}></Frame>
    </div>
  );
};
