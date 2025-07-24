import React from "react";
import { Element, useNode, type UserComponent } from "@craftjs/core";
import { Row, Section } from "@react-email/components";
import { EmailColumn } from "../column";

export type EmailSectionProps = {
  numberOfColumns?: number;
  children?: React.ReactNode;
  height?: string;
};

export const SingleSection: UserComponent<EmailSectionProps> = ({ children }) => {
  return (
    <Section style={{ padding: "16px", width: "100%" }}>
      <Row style={{ width: "100%" }}>{children}</Row>
    </Section>
  );
};

export const EmailSection: UserComponent<EmailSectionProps> = ({
  numberOfColumns = 2,
  children,
  height,
}: EmailSectionProps) => {
  const {
    connectors: { connect },
  } = useNode();

  const columns = Number(numberOfColumns) || 1;

  return (
    <div
      ref={(dom) => {
        if (!dom) return;
        connect(dom);
      }}
      style={{ width: "100%", height: "auto" }}
    >
      <Element key={columns} id={"Section_Parent"} is={SingleSection} canvas height={height}>
        {Array.from({ length: columns }).map((_, index) => (
          <Element key={index} id={`column-${index}`} is={EmailColumn} canvas width={100 / columns}>
            {children}
          </Element>
        ))}
      </Element>
    </div>
  );
};
