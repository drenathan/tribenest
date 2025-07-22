import React from "react";

import { useNode, type UserComponent } from "@craftjs/core";
import { Container } from "@react-email/components";

export type EmailContainerProps = {
  children?: React.ReactNode;
  className?: string;
  width?: string;
};

export const EmailContainer: UserComponent<EmailContainerProps> = ({ children, width }) => {
  const {
    connectors: { connect },
    actions: { setProp },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <table
      ref={(dom) => {
        if (!dom) return;
        connect(dom);
      }}
      align="center"
      width="100%"
      border={0}
      cellPadding="0"
      cellSpacing="0"
      role="presentation"
      style={{ maxWidth: "37.5em", width, height: "100%", fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <tbody>
        <tr style={{ width: "100%", verticalAlign: "top" }}>
          <td>{children}</td>
        </tr>
      </tbody>
    </table>
  );
};
