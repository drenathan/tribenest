"use client";

import { Element } from "@craftjs/core";
import { Container, EditorFooter, EditorRichText, PageHeader } from "../../components/editor/selectors";

export default function CookiePolicyPage() {
  return (
    <Element
      canvas
      is={Container}
      height="100%"
      id="page-container"
      paddingHorizontal="0"
      paddingVertical="0"
      custom={{ displayName: "Page", preventDelete: true }}
    >
      <PageHeader logo={""} background={""} hasBorder={true} />
      <Container height="100%">
        <EditorRichText text="Cookie Policy Content" />
      </Container>
      <EditorFooter />
    </Element>
  );
}

CookiePolicyPage.craft = {
  name: "CookiePolicyPage",
  custom: {
    preventDelete: true,
  },
};
