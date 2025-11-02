import React from "react";

import { ToolbarItem, ToolbarSection } from "../../Toolbar";
import { ToolbarRadio } from "../../Toolbar/ToolbarRadio";
import { useNode } from "@craftjs/core";

export const ContainerSettings = () => {
  const { backgroundImage, backgroundVideo } = useNode((node) => ({
    backgroundImage: node.data.props.backgroundImage || null,
    backgroundVideo: node.data.props.backgroundVideo,
  }));
  return (
    <React.Fragment>
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
      <ToolbarSection
        title="Colors"
        props={["background", "color"]}
        defaultExpanded={true}
        summary={({ background, color }: any) => {
          return (
            <div className="flex flex-row-reverse text-foreground">
              <div
                style={{ background }}
                className="shadow-md flex-end w-6 h-6 text-center flex items-center rounded-full bg-black"
              >
                <p style={{ color }} className="w-full text-center">
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
        <ToolbarItem propKey="marginHorizontal" type="slider" label="Horizontal" />
        <ToolbarItem propKey="marginVertical" type="slider" label="Vertical" />
      </ToolbarSection>
      <ToolbarSection
        title="Padding"
        props={["paddingHorizontal", "paddingVertical"]}
        summary={({ paddingHorizontal, paddingVertical }: any) => {
          return `${paddingHorizontal || 0}px ${paddingVertical || 0}px`;
        }}
      >
        <ToolbarItem propKey="paddingHorizontal" type="slider" label="Horizontal" />
        <ToolbarItem propKey="paddingVertical" type="slider" label="Vertical" />
      </ToolbarSection>
      <ToolbarSection title="Decoration" props={["radius", "shadow"]}>
        <ToolbarItem full={true} propKey="radius" type="slider" label="Radius" />
        <ToolbarItem full={true} propKey="shadow" type="slider" label="Shadow" />
      </ToolbarSection>
      <ToolbarSection title="Background Image" props={["backgroundImage"]}>
        <ToolbarItem full={true} propKey="backgroundImage" type="image" label="Background Image" />
      </ToolbarSection>
      <ToolbarSection title="Background Video" props={["backgroundVideo"]}>
        <ToolbarItem full={true} propKey="backgroundVideo" type="video" label="Background Video" />
      </ToolbarSection>

      {(backgroundImage || backgroundVideo) && (
        <>
          <ToolbarItem
            className="my-6"
            full={true}
            propKey="backgroundBrightness"
            type="slider"
            label="Background Brightness"
            min={0}
            max={100}
          />

          <ToolbarItem
            className="my-6"
            full={true}
            propKey="backgroundBlur"
            type="slider"
            label="Background Blur"
            min={0}
            max={100}
          />
        </>
      )}

      <ToolbarSection title="Alignment">
        {/* <ToolbarItem propKey="flexDirection" type="radio" label="Flex Direction">
          <ToolbarRadio value="row" label="Row" />
          <ToolbarRadio value="column" label="Column" />
        </ToolbarItem>
        <ToolbarItem propKey="fillSpace" type="radio" label="Fill space">
          <ToolbarRadio value="yes" label="Yes" />
          <ToolbarRadio value="no" label="No" />
        </ToolbarItem> */}
        <ToolbarItem propKey="alignItems" type="radio" label="Align Items">
          <ToolbarRadio value="flex-start" label="Left" />
          <ToolbarRadio value="center" label="Center" />
          <ToolbarRadio value="flex-end" label="Right" />
        </ToolbarItem>
        <ToolbarItem propKey="justifyContent" type="radio" label="Justify Content">
          <ToolbarRadio value="flex-start" label="Top" />
          <ToolbarRadio value="center" label="Center" />
          <ToolbarRadio value="flex-end" label="Bottom" />
        </ToolbarItem>
      </ToolbarSection>
    </React.Fragment>
  );
};
