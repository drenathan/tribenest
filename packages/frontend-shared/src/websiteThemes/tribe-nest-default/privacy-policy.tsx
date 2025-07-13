"use client";

import { Element } from "@craftjs/core";
import { Container, PageHeader } from "../../components/editor/selectors";

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
        <div>Privacy Policy work</div>
      </Container>
    </Element>
  );
}

PrivacyPolicyPage.craft = {
  name: "PrivacyPolicyPage",
  custom: {
    preventDelete: true,
  },
};
