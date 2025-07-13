import React from "react";

import { ToolbarItem, ToolbarSection } from "../../Toolbar";
import { ToolbarRadio } from "../../Toolbar/ToolbarRadio";
import type { TextProps } from ".";
import { capitalize, weightDescription } from "../../utils/text";

export const TextSettings = () => {
  return (
    <React.Fragment>
      <ToolbarSection
        title="Typography"
        props={["fontSize", "fontWeight", "textAlign"]}
        summary={({ fontSize, fontWeight, textAlign }: TextProps) => {
          return `${fontSize || ""}, ${weightDescription(parseInt(fontWeight))}, ${capitalize(textAlign)}`;
        }}
      >
        <ToolbarItem full={true} propKey="fontSize" type="slider" label="Font Size" />
        <ToolbarItem full={true} propKey="fontSizeMobile" type="slider" label="Font Size Mobile" />
        <ToolbarItem propKey="textAlign" type="radio" label="Align">
          <ToolbarRadio value="left" label="Left" />
          <ToolbarRadio value="center" label="Center" />
          <ToolbarRadio value="right" label="Right" />
        </ToolbarItem>
        <ToolbarItem propKey="fontWeight" type="radio" label="Weight">
          <ToolbarRadio value="400" label="Regular" />
          <ToolbarRadio value="500" label="Medium" />
          <ToolbarRadio value="700" label="Bold" />
        </ToolbarItem>
      </ToolbarSection>
      <ToolbarSection
        title="Margin"
        props={["marginHorizontal", "marginVertical"]}
        summary={({ marginHorizontal, marginVertical }: TextProps) => {
          return `${marginHorizontal || 0}px ${marginVertical || 0}px`;
        }}
      >
        <ToolbarItem propKey="marginHorizontal" index={0} type="slider" label="Horizontal" />
        <ToolbarItem propKey="marginVertical" index={1} type="slider" label="Vertical" />
      </ToolbarSection>
      <ToolbarSection
        title="Appearance"
        props={["color", "shadow"]}
        summary={({ color, shadow }: TextProps) => {
          return (
            <div className="fletext-right">
              <p
                style={{ color, textShadow: `0px 0px 2px rgba(0, 0, 0, ${shadow / 100})` }}
                className="text-white text-right"
              >
                T
              </p>
            </div>
          );
        }}
      >
        <ToolbarItem full={true} propKey="color" type="color" label="Text Color" />
        <ToolbarItem full={true} propKey="shadow" type="slider" label="Shadow" />
      </ToolbarSection>
    </React.Fragment>
  );
};
