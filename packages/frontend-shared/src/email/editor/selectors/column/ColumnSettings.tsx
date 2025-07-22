import React from "react";
import { ToolbarItem, ToolbarSection } from "../../../../components/editor";

export const EmailColumnSettings = () => {
  return (
    <React.Fragment>
      <ToolbarSection title="Height" props={["height"]} defaultExpanded={true}>
        <ToolbarItem full={true} propKey="height" type="slider" label="Height" min={100} max={1000} />
      </ToolbarSection>
    </React.Fragment>
  );
};
