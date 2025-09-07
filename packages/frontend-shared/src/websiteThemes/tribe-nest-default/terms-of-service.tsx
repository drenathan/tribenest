"use client";

import { Element } from "@craftjs/core";
import { Container, EditorFooter, EditorRichText, PageHeader } from "../../components/editor/selectors";

export default function TermsOfServicePage() {
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
        <EditorRichText text="Terms of Service Content" />
      </Container>
      <EditorFooter />
    </Element>
  );
}

TermsOfServicePage.craft = {
  name: "TermsOfServicePage",
  custom: {
    preventDelete: true,
  },
};
