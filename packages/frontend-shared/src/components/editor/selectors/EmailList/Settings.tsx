import React from "react";
import { ToolbarItem, ToolbarSection } from "../../Toolbar";
import { ToolbarRadio } from "../../Toolbar/ToolbarRadio";

export const EmailListSettings = () => {
  return (
    <React.Fragment>
      <ToolbarItem full={true} propKey="title" type="text" label="Title" className="my-6" />

      <ToolbarItem full={true} propKey="description" index={0} type="text" label="Description" className="my-6" />

      <ToolbarItem full={true} propKey="buttonText" index={0} type="text" label="Button Text" className="my-6" />

      <ToolbarItem full={true} propKey="buttonId" index={0} type="text" label="Button ID" className="my-6" />

      <ToolbarItem full={true} propKey="emailListId" index={0} type="text" label="Email List ID" className="my-6" />

      <ToolbarItem
        full={true}
        propKey="successMessage"
        index={0}
        type="text"
        label="Success Message"
        className="my-6"
      />

      <ToolbarItem full={true} propKey="alignItems" type="radio" label="Align Items">
        <ToolbarRadio value="flex-start" label="Left" />
        <ToolbarRadio value="center" label="Center" />
        <ToolbarRadio value="flex-end" label="Right" />
      </ToolbarItem>
    </React.Fragment>
  );
};
