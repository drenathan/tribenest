import React from "react";
import { ToolbarItem, ToolbarSection } from "../../../../components/editor";

export const EmailImageSettings = () => {
  return (
    <React.Fragment>
      <ToolbarSection title="Image" props={["src"]} defaultExpanded={true}>
        <ToolbarItem full={true} propKey="src" type="image" label="Image" />
      </ToolbarSection>
      <ToolbarSection title="Dimensions" props={["height", "width"]} defaultExpanded={true}>
        <ToolbarItem propKey="height" index={0} type="slider" label="Height" />
        <ToolbarItem propKey="width" index={1} type="slider" label="Width" />
      </ToolbarSection>
    </React.Fragment>
  );
};
