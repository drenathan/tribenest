import React from "react";
import { ToolbarItem, ToolbarSection } from "../../../../components/editor";

export const EmailImageSettings = () => {
  return (
    <React.Fragment>
      <ToolbarSection title="Image" props={["src"]} defaultExpanded={true}>
        <ToolbarItem full={true} propKey="src" type="image" label="Image" />
      </ToolbarSection>
      <ToolbarSection
        defaultExpanded={true}
        title="Dimensions"
        props={["width", "height"]}
        summary={({ width, height }: any) => {
          return `${width || 0} x ${height || 0}`;
        }}
      >
        <ToolbarItem propKey="width" type="text" label="Width" />
        <ToolbarItem propKey="height" type="text" label="Height" />
      </ToolbarSection>
    </React.Fragment>
  );
};
