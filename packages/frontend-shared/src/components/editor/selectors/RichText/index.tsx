import { useNode, type UserComponent } from "@craftjs/core";
import { RichTextSettings } from "./RichTextSettings";
import { useEditorContext } from "../../context";

export type RichTextProps = {
  text?: string;
};

export const EditorRichText: UserComponent<RichTextProps> = ({ text = "" }) => {
  const {
    connectors: { connect },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));
  const { themeSettings } = useEditorContext();

  return (
    <p
      ref={(dom) => {
        if (!dom) return;
        connect(dom);
      }}
      style={{
        color: themeSettings.colors.text,
      }}
      dangerouslySetInnerHTML={{ __html: text }}
    ></p>
  );
};

EditorRichText.craft = {
  displayName: "Rich Text",
  props: {
    text: `<p dir="ltr"><span style="font-size: 18px; white-space: pre-wrap;">Click here and edit the content from the right side panel</span></p>`,
  },
  related: {
    toolbar: RichTextSettings,
  },
};
