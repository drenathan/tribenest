"use client";
import { Element } from "@craftjs/core";
import { Container, EditorFooter, PageHeader } from "../../components/editor/selectors";
import { MusicDetailsContent } from "./components/MusicDetailsContent";

export default function MusicDetailsPage() {
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
      <MusicDetailsContent />
      <EditorFooter />
    </Element>
  );
}

MusicDetailsPage.craft = {
  name: "MusicDetailsPage",
  custom: {
    preventDelete: true,
  },
};
