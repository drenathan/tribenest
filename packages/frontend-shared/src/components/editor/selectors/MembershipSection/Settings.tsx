import { ToolbarItem } from "../../Toolbar/ToolbarItem";
import { ToolbarRadio } from "../../Toolbar/ToolbarRadio";
import { ToolbarSection } from "../../Toolbar/ToolbarSection";

export const MembershipSectionSettings = () => {
  return (
    <>
      <>
        <ToolbarSection title="Title" props={["title"]} defaultExpanded={true}>
          <ToolbarItem full={true} propKey="title" type="text" />
        </ToolbarSection>
        <ToolbarItem full={true} propKey="alignItems" type="radio" label="Align Items">
          <ToolbarRadio value="flex-start" label="Left" />
          <ToolbarRadio value="center" label="Center" />
          <ToolbarRadio value="flex-end" label="Right" />
        </ToolbarItem>
      </>
    </>
  );
};
