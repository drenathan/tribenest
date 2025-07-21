"use client";
import { type UserComponent, useNode } from "@craftjs/core";
import { useEffect } from "react";
import { useEditorContext } from "../../context";
import { ImageSettings } from "./ImageSettings";

export type ImageProps = {
  cornerRadius?: string;
  src?: string;
  className?: string;
  width?: string;
  height?: string;
  shouldConnect?: boolean;
  style?: React.CSSProperties;
  marginHorizontal?: string;
  marginVertical?: string;
};

export const EditorImage: UserComponent<ImageProps> = ({
  src,
  width,
  height,
  className,
  cornerRadius,
  shouldConnect = true,
  style,
  marginHorizontal = "0",
  marginVertical = "0",
}: ImageProps) => {
  const { themeSettings } = useEditorContext();
  const {
    connectors: { connect },
    actions: { setProp },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  useEffect(() => {
    setProp((prop: ImageProps) => {
      prop.cornerRadius = cornerRadius ?? themeSettings.cornerRadius;
    });
  }, [themeSettings, setProp, cornerRadius]);

  return (
    <img
      ref={(dom) => {
        if (!dom) return;
        if (shouldConnect) {
          connect(dom);
        }
      }}
      src={src}
      className={className}
      style={{
        borderRadius: `${cornerRadius}px`,
        margin: `${marginVertical}px ${marginHorizontal}px`,
        width: `${width}px`,
        height: `${height}px`,
        objectFit: "cover",
        flexShrink: 0,
        ...(style || {}),
      }}
    />
  );
};

EditorImage.craft = {
  displayName: "Image",
  props: {
    width: "200",
    height: "200",
  },
  related: {
    toolbar: ImageSettings,
  },
};
