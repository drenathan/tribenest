"use client";

import { Element } from "@craftjs/core";
import { Container, EditorFooter, PageHeader } from "../../components/editor/selectors";
import { ContactPageContent } from "./components/ContactPageContent";

export default function ContactPage() {
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

      <ContactPageContent />

      <EditorFooter />
    </Element>
  );
}

ContactPage.craft = {
  name: "ContactPage",
  custom: {
    preventDelete: true,
  },
};
