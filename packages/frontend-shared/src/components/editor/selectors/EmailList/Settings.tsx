import React from "react";
import { ToolbarItem, ToolbarSection } from "../../Toolbar";

export const EmailListSettings = () => {
  return (
    <React.Fragment>
      <ToolbarSection title="Title" props={["title"]}>
        <ToolbarItem full={true} propKey="title" type="text" label="Title" />
      </ToolbarSection>
      <ToolbarSection title="Description" props={["description"]}>
        <ToolbarItem full={true} propKey="description" index={0} type="text" label="Description" />
      </ToolbarSection>
      <ToolbarSection title="Button Text" props={["buttonText"]}>
        <ToolbarItem full={true} propKey="buttonText" index={0} type="text" label="Button Text" />
      </ToolbarSection>
      <ToolbarSection title="Button ID" props={["buttonId"]}>
        <ToolbarItem propKey="buttonId" index={0} type="text" label="Button ID" />
      </ToolbarSection>
      <ToolbarSection title="Email List ID" props={["emailListId"]}>
        <ToolbarItem full={true} propKey="emailListId" index={0} type="text" label="Email List ID" />
      </ToolbarSection>
      <ToolbarSection title="Success Message" props={["successMessage"]}>
        <ToolbarItem full={true} propKey="successMessage" index={0} type="text" label="Success Message" />
      </ToolbarSection>
    </React.Fragment>
  );
};
