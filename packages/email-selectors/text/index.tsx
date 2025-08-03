import { useNode, type UserComponent } from "@craftjs/core";

export type EmailTextProps = {
  text?: string;
};

export const EmailText: UserComponent<EmailTextProps> = ({ text = "" }) => {
  const {
    connectors: { connect },
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
      style={{ fontSize: "18px" }}
    ></p>
  );
};
