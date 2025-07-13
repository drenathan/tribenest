import React from "react";
import { ToolbarItem, ToolbarSection } from "../../Toolbar";
import { ToolbarRadio } from "../../Toolbar/ToolbarRadio";

export const ButtonSettings = () => {
  return (
    <React.Fragment>
      <ToolbarSection
        title="Colors"
        props={["background", "color"]}
        summary={({ background, color }: any) => {
          return (
            <div className="flex flex-row-reverse">
              <div
                style={{ background }}
                className="shadow-md flex-end w-6 h-6 text-center flex items-center rounded-full bg-black"
              >
                <p style={{ color }} className="text-white w-full text-center">
                  T
                </p>
              </div>
            </div>
          );
        }}
      >
        <ToolbarItem full={true} propKey="background" type="bg" label="Background" />
        <ToolbarItem full={true} propKey="color" type="color" label="Text" />
      </ToolbarSection>
      <ToolbarSection
        title="Margin"
        props={["marginHorizontal", "marginVertical"]}
        summary={({ marginHorizontal, marginVertical }: any) => {
          return `${marginHorizontal || 0}px ${marginVertical || 0}px`;
        }}
      >
        <ToolbarItem propKey="marginHorizontal" index={0} type="slider" label="Horizontal" />
        <ToolbarItem propKey="marginVertical" index={1} type="slider" label="Vertical" />
      </ToolbarSection>
      <ToolbarSection title="Decoration">
        <ToolbarItem propKey="buttonStyle" type="radio" label="Style">
          <ToolbarRadio value="full" label="Full" />
          <ToolbarRadio value="outline" label="Outline" />
        </ToolbarItem>
      </ToolbarSection>
    </React.Fragment>
  );
};
