"use client";
import { useEffect } from "react";
import { useNode, type UserComponent } from "@craftjs/core";
import { Button } from "@react-email/components";
import { useSelectorContext } from "../selectorContext";

export type EmailButtonProps = {
  title?: string;
  link?: string;
  backgroundColor?: string;
  color?: string;
};

export const EmailButton: UserComponent<EmailButtonProps> = ({ title, link, backgroundColor, color }) => {
  const { isRenderMode } = useSelectorContext();
  const {
    connectors: { connect },
    actions: { setProp },
  } = useNode();

  useEffect(() => {
    if (!isRenderMode) {
      setProp((props: EmailButtonProps) => {
        props.backgroundColor = backgroundColor || "#000";
        props.color = color || "#fff";
        props.title = title || "Button";
        props.link = link || "https://www.google.com";
      });
    }
  }, [isRenderMode]);

  return (
    <Button
      ref={(dom) => {
        if (!dom) return;
        connect(dom);
      }}
      href={isRenderMode ? link : undefined}
      style={{
        backgroundColor: backgroundColor || "#000",
        color: color || "#fff",
        padding: "10px 20px",
        borderRadius: "5px",
      }}
    >
      {title}
    </Button>
  );
};
