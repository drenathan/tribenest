import React from "react";
import { ToolbarItem, ToolbarSection } from "../../Toolbar";
import type { ImageProps } from ".";

export const ImageSettings = () => {
  return (
    <React.Fragment>
      <ToolbarSection title="Image" props={["src"]}>
        <ToolbarItem full={true} propKey="src" type="image" label="Image" />
      </ToolbarSection>
      <ToolbarSection
        title="Dimensions"
        props={["height", "width"]}
        summary={({ height, width }: ImageProps) => {
          return `${width || 0}px  ${height || 0}px`;
        }}
      >
        <ToolbarItem propKey="height" index={0} type="slider" label="Height" />
        <ToolbarItem propKey="width" index={1} type="slider" label="Width" />
      </ToolbarSection>
      <ToolbarSection
        title="Margin"
        props={["marginHorizontal", "marginVertical"]}
        summary={({ marginHorizontal, marginVertical }: ImageProps) => {
          return `${marginHorizontal || 0}px ${marginVertical || 0}px`;
        }}
      >
        <ToolbarItem propKey="marginHorizontal" type="slider" label="Horizontal" />
        <ToolbarItem propKey="marginVertical" type="slider" label="Vertical" />
      </ToolbarSection>
      <ToolbarSection
        title="Corner Radius"
        props={["cornerRadius"]}
        summary={({ cornerRadius }: ImageProps) => {
          return `${cornerRadius || 0}px`;
        }}
      >
        <ToolbarItem propKey="cornerRadius" index={0} type="slider" label="Corner Radius" />
      </ToolbarSection>
    </React.Fragment>
  );
};
