"use client";
import { Element } from "@craftjs/core";
import { Container, PageHeader } from "../../components/editor/selectors";
import { MusicPageContent } from "./components/MusicPageContent";

export default function MusicPage() {
  return (
    <Element
      canvas
      is={Container}
      height="auto"
      id="page-container"
      paddingHorizontal="0"
      paddingVertical="0"
      width="100%"
      custom={{ displayName: "Page", preventDelete: true }}
    >
      <PageHeader logo={""} background={""} hasBorder={true} />

      <MusicPageContent />
    </Element>
  );
}

MusicPage.craft = {
  name: "MusicPage",
  custom: {
    preventDelete: true,
  },
};
