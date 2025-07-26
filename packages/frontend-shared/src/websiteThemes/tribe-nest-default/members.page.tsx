"use client";
import { Element } from "@craftjs/core";
import { Container, EditorFooter, PageHeader } from "../../components/editor/selectors";
import { PostsPage } from "./components/PostsPage";

export default function MembersPage() {
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

      <PostsPage />

      <EditorFooter />
    </Element>
  );
}

MembersPage.craft = {
  name: "MembersPage",
  custom: {
    preventDelete: true,
  },
};
