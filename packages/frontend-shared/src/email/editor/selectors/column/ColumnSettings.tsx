import React from "react";
import { ToolbarItem, ToolbarSection } from "../../../../components/editor";
import { ToolbarRadio } from "../../../../components/editor/Toolbar/ToolbarRadio";

export const EmailColumnSettings = () => {
  return (
    <React.Fragment>
      <ToolbarSection title="Height" props={["height"]} defaultExpanded={true}>
        <ToolbarItem full={true} propKey="height" type="slider" min={100} max={1000} />
      </ToolbarSection>
      <ToolbarSection title="Alignment" props={["horizontalAlign", "verticalAlign"]} defaultExpanded={true}>
        <ToolbarItem propKey="verticalAlign" type="radio" label="Vertical Alignment">
          <ToolbarRadio value="top" label="Top" />
          <ToolbarRadio value="center" label="Center" />
          <ToolbarRadio value="bottom" label="Bottom" />
        </ToolbarItem>
        <ToolbarItem propKey="horizontalAlign" type="radio" label="Horizontal Alignment">
          <ToolbarRadio value="left" label="Left" />
          <ToolbarRadio value="center" label="Center" />
          <ToolbarRadio value="right" label="Right" />
        </ToolbarItem>
      </ToolbarSection>
    </React.Fragment>
  );
};
