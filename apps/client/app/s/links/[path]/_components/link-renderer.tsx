"use client";

import { editorResolver, RenderNode, SmartLink, smartLinkTemplates, usePublicAuth } from "@tribe-nest/frontend-shared";

import { Editor, Frame } from "@craftjs/core";

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
  return (
    <div className="w-full h-full">
      <Frame data={smartLink.content}></Frame>
    </div>
  );
};
