import React from "react";
import { useNode, type UserComponent } from "@craftjs/core";
import { Column } from "@react-email/components";

export type EmailColumnProps = {
  children?: React.ReactNode;
  className?: string;
  width?: number;
  height?: string;
};

export const EmailColumn: UserComponent<EmailColumnProps> = ({ children, width, height }) => {
  const {
    connectors: { connect },
    nodes,
  } = useNode((node) => ({
    selected: node.events.selected,
    nodes: node.data.nodes,
  }));

  const hasChildren = nodes.length > 0;

  return (
    <Column
      ref={(dom) => {
        if (!dom) return;
        connect(dom);
      }}
      style={{
        width: `${width}%`,
        verticalAlign: "top",
        height: `${height}px`,
        overflow: "hidden",
      }}
    >
      {children}
      {!hasChildren && (
        <div className="text-center text-sm text-muted-foreground flex items-center justify-center h-full">
          Add Content Here
        </div>
      )}
    </Column>
  );
};
