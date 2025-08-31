"use client";

import {
  editorResolver,
  RenderNode,
  SmartLink,
  smartLinkTemplates,
  useEditorContext,
  usePublicAuth,
} from "@tribe-nest/frontend-shared";

import { Editor, Frame } from "@craftjs/core";
import { useEffect } from "react";

export const LinkRenderer = ({ smartLink }: { smartLink: SmartLink }) => {
  const { isInitialized } = usePublicAuth();

  if (!isInitialized) {
    return null;
  }

  const Template = smartLink?.template
    ? smartLinkTemplates.find((template) => template.slug === smartLink.template)?.Component
    : null;

  return (
    <Editor
      enabled={false}
      resolver={{ ...editorResolver, ...(Template ? { page: Template } : {}) }}
      onRender={RenderNode}
    >
      <PageContent smartLink={smartLink} />
    </Editor>
  );
};

const PageContent = ({ smartLink }: { smartLink: SmartLink }) => {
  const { themeSettings, trackEvent } = useEditorContext();

  useEffect(() => {
    trackEvent?.("page_view");
  }, [trackEvent]);

  return (
    <div
      className="w-full h-full"
      style={{
        backgroundColor: themeSettings?.colors?.background,
        color: themeSettings?.colors?.text,
      }}
    >
      <Frame data={smartLink.content}></Frame>
    </div>
  );
};
