import React from "react";
import { type UserComponent, useNode } from "@craftjs/core";

export type ImageProps = {
  src?: string;
};

export const EmailImage: UserComponent<ImageProps> = ({ src }: ImageProps) => {
  const {
    connectors: { connect },
  } = useNode();

  return (
    <div
      ref={(dom) => {
        if (!dom) return;

        connect(dom);
      }}
      style={{
        width: "100%",
        height: "200px",
        overflow: "hidden",
      }}
    >
      <img
        src={src || undefined}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
};
