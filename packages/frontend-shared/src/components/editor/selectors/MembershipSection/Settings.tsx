import { ToolbarItem } from "../../Toolbar/ToolbarItem";
import { ToolbarSection } from "../../Toolbar/ToolbarSection";

export const MembershipSectionSettings = () => {
  return (
    <>
      <>
        <ToolbarSection title="Title" props={["title"]} defaultExpanded={true}>
          <ToolbarItem full={true} propKey="title" type="text" />
        </ToolbarSection>
      </>
    </>
  );
};
