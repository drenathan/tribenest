import React, { useEffect } from "react";
import { useNode, type UserComponent } from "@craftjs/core";
import { Column } from "@react-email/components";
import { useSelectorContext } from "../selectorContext";

export type EmailColumnProps = {
  children?: React.ReactNode;
  className?: string;
  width?: number;
  height?: string;
  horizontalAlign?: "left" | "center" | "right";
  verticalAlign?: "top" | "center" | "bottom";
};

export const EmailColumn: UserComponent<EmailColumnProps> = ({
  children,
  width,
  height,
  horizontalAlign = "center",
  verticalAlign = "center",
}) => {
  const {
    connectors: { connect },
    nodes,
    actions: { setProp },
  } = useNode((node) => ({
    nodes: node.data.nodes,
  }));

  const { isRenderMode } = useSelectorContext();

  useEffect(() => {
    if (!isRenderMode) {
      setProp((props: EmailColumnProps) => {
        props.height = height;
        props.horizontalAlign = horizontalAlign;
        props.verticalAlign = verticalAlign;
      });
    }
  }, [isRenderMode]);

  const hasChildren = nodes.length > 0;

  return (
    <Column
      ref={(dom) => {
        if (!dom) return;
        connect(dom);
      }}
      style={{
        width: `${width}%`,
        verticalAlign: verticalAlign,
        height: `${height}px`,
        textAlign: horizontalAlign,
      }}
    >
      {children}
      {!hasChildren && !isRenderMode && (
        <div className="text-center text-sm text-muted-foreground flex items-center justify-center h-full">
          Add Content Here
        </div>
      )}
    </Column>
  );
};
