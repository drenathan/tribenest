"use client";
import React, { useEffect } from "react";
import { ContainerSettings } from "./ContainerSettings";
import { useEditor, useNode } from "@craftjs/core";
import { useEditorContext } from "../../context";
import { round } from "lodash";

export type ContainerProps = {
  background: string;
  color: string;
  flexDirection: "row" | "column";
  alignItems: string;
  justifyContent: string;
  fillSpace: string;
  width: string;
  height: string;
  paddingHorizontal: string;
  paddingVertical: string;
  marginHorizontal: string;
  marginVertical: string;
  shadow: number;
  children: React.ReactNode;
  radius: number;
  backgroundImage: string;
  style: React.CSSProperties;
  className: string;
  backgroundVideo: string;
  backgroundBrightness: number;
  backgroundBlur: number;
};

const defaultProps: Partial<ContainerProps> = {
  shadow: 0,
  radius: 0,
  width: "100%",
  height: "auto",
  paddingHorizontal: "10",
  paddingVertical: "10",
  marginHorizontal: "0",
  marginVertical: "0",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  fillSpace: "no",
  className: "",
  backgroundBrightness: 100,
  backgroundBlur: 0,
};

export const Container = (props: Partial<ContainerProps>) => {
  const { themeSettings } = useEditorContext();
  const {
    actions: { setProp },
    connectors: { connect },
    nodes,
  } = useNode((node) => ({
    nodes: node.data.nodes,
  }));
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  props = {
    ...defaultProps,
    ...props,
  };

  useEffect(() => {
    setProp((prop: ContainerProps) => {
      prop.color = themeSettings.colors.text;
      prop.background = themeSettings.colors.background;
    });
  }, [themeSettings, setProp]);

  const hasChildren = nodes.length > 0;

  const {
    flexDirection,
    alignItems,
    justifyContent,
    fillSpace,
    background,
    color,
    paddingHorizontal,
    paddingVertical,
    marginHorizontal,
    marginVertical,
    shadow,
    radius,
    children,
    height,
    backgroundImage,
    style,
    width,
    className,
    backgroundVideo,
    backgroundBrightness = 100,
    backgroundBlur = 0,
  } = props;

  const filter = `brightness(${round(Number(backgroundBrightness) / 100, 2)}) blur(${backgroundBlur}px)`;
  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(ref);
        }
      }}
      className={className}
      style={{
        display: "flex",
        flexDirection,
        alignItems,
        position: "relative",
        justifyContent,
        backgroundColor:
          backgroundImage || backgroundVideo ? "transparent" : (background ?? themeSettings.colors.background),
        color: color ?? themeSettings.colors.text,
        padding: `${paddingVertical}px ${paddingHorizontal}px`,
        margin: `${marginVertical}px ${marginHorizontal}px`,
        boxShadow: shadow === 0 ? "none" : `0px 3px 100px ${shadow}px rgba(0, 0, 0, 0.13)`,
        borderRadius: `${radius}px`,
        flex: fillSpace === "yes" ? 1 : "unset",
        minHeight: height,
        height: height.includes("%") ? height : "auto",
        width,
        ...(style ? style : {}),
      }}
    >
      {backgroundImage && !backgroundVideo && (
        <div
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "top",
            backgroundRepeat: "no-repeat",
            filter,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      )}
      {backgroundVideo && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            filter,
          }}
        >
          <video src={backgroundVideo} autoPlay loop muted playsInline className="object-cover w-[100%] h-[100%]" />
        </div>
      )}
      <div className="z-1 w-full h-full max-w-[1440px] mx-auto flex flex-col items-center">
        {children}

        {!hasChildren && enabled && (
          <div className="w-full text-sm text-muted-foreground flex items-center justify-center">
            Drag and drop content here
          </div>
        )}
      </div>
    </div>
  );
};

Container.craft = {
  displayName: "Container",
  props: defaultProps,
  rules: {
    canDrag: () => true,
  },
  related: {
    toolbar: ContainerSettings,
  },
};
