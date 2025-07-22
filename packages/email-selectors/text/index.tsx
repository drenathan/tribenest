import React from "react";
import { useNode, type UserComponent } from "@craftjs/core";
import { Text } from "@react-email/components";

export type EmailTextProps = {
  text?: string;
  editorJson?: string;
};

export const EmailText: UserComponent<EmailTextProps> = ({ text, editorJson }) => {
  const {
    connectors: { connect },
    actions: { setProp },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <p
      ref={(dom) => {
        if (!dom) return;
        connect(dom);
      }}
      dangerouslySetInnerHTML={{ __html: text }}
      style={{ fontSize: "16px" }}
    ></p>
  );
};
