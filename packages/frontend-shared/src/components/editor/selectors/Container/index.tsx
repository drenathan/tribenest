"use client";
import React, { useEffect } from "react";
import { ContainerSettings } from "./ContainerSettings";
import { useNode } from "@craftjs/core";
import { useEditorContext } from "../../context";

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
};

export const Container = (props: Partial<ContainerProps>) => {
  const { themeSettings } = useEditorContext();
  const {
    actions: { setProp },
    connectors: { connect },
  } = useNode();

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
  } = props;
  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(ref);
        }
      }}
      style={{
        flexDirection,
        alignItems,
        position: "relative",
        justifyContent,
        background: backgroundImage ? "transparent" : (background ?? themeSettings.colors.background),
        color: color ?? themeSettings.colors.text,
        padding: `${paddingVertical}px ${paddingHorizontal}px`,
        margin: `${marginVertical}px ${marginHorizontal}px`,
        boxShadow: shadow === 0 ? "none" : `0px 3px 100px ${shadow}px rgba(0, 0, 0, 0.13)`,
        borderRadius: `${radius}px`,
        flex: fillSpace === "yes" ? 1 : "unset",
        height,
      }}
    >
      {backgroundImage && (
        <div
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "top",
            backgroundRepeat: "no-repeat",
            filter: "brightness(0.6)",
            zIndex: -1,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      )}
      {children}
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
