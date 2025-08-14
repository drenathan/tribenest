"use client";

import {
  editorResolver,
  RenderNode,
  useEditorContext,
  usePublicAuth,
  websiteThemes,
} from "@tribe-nest/frontend-shared";
import { WebPage } from "../_api";

import { Editor, Frame } from "@craftjs/core";
import { useEffect } from "react";

export const PageRenderer = ({ webPage, paramId }: { webPage: WebPage; paramId?: string }) => {
  const theme = websiteThemes.find((theme) => theme.slug === webPage.themeName);
  const currentPage = theme?.pages.find((page) => page.pathname === webPage.page.pathname);
  const { isInitialized } = usePublicAuth();
  const { setCurrentProductId } = useEditorContext();

  useEffect(() => {
    if (paramId) {
      switch (webPage.page.pathname) {
        case "/music/:id":
          setCurrentProductId!(paramId);
          break;
        default:
          break;
      }
    }
  }, [paramId, webPage.page.pathname, setCurrentProductId]);

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
  return (
    <div className="w-full h-full">
      <Frame data={webPage.page.content}></Frame>
    </div>
  );
};
