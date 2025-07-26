"use client";

import { Element } from "@craftjs/core";
import { Container, EditorFooter, PageHeader } from "../../components/editor/selectors";

export default function PrivacyPolicyPage() {
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
      <PageHeader logo={""} background={""} />
      <Container>
        <div className="min-h-[100vh]">Privacy Policy work</div>
      </Container>
      <EditorFooter />
    </Element>
  );
}

PrivacyPolicyPage.craft = {
  name: "PrivacyPolicyPage",
  custom: {
    preventDelete: true,
  },
};
