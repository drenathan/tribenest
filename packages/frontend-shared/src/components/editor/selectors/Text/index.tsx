"use client";
import { useNode, useEditor } from "@craftjs/core";
import ContentEditable from "react-contenteditable";

import { TextSettings } from "./TextSettings";
import { useEffect } from "react";
import { useContainerQueryContext, useEditorContext } from "../../context";

export type TextProps = {
  fontSize: string;
  fontSizeMobile: string;
  textAlign: string;
  fontWeight: string;
  color: string;
  shadow: number;
  text: string;
  marginHorizontal: string;
  marginVertical: string;
  preventEdit?: boolean;
};

export const EditorText = ({
  fontSize,
  fontSizeMobile,
  textAlign,
  fontWeight,
  color,
  shadow,
  text,
  marginHorizontal,
  marginVertical,
  preventEdit,
}: Partial<TextProps>) => {
  const { themeSettings } = useEditorContext();
  const {
    connectors: { connect },
    actions: { setProp },
  } = useNode();
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const { matches } = useContainerQueryContext();

  useEffect(() => {
    setProp((prop: TextProps) => {
      prop.color = themeSettings.colors.text;
    });
  }, [themeSettings, setProp]);

  return (
    <ContentEditable
      innerRef={connect}
      html={text || ""}
      disabled={preventEdit || !enabled}
      className={`outline-primary`}
      onChange={(e) => {
        setProp((prop: TextProps) => (prop.text = e.target.value), 500);
      }} // use true to disable editing
      tagName="p"
      onPaste={(e) => {
        e.preventDefault();
        // get plain text only
        const text = e.clipboardData.getData("text/plain");

        const selection = window.getSelection();
        if (!selection?.rangeCount) return;

        // get current cursor position
        const range = selection.getRangeAt(0);

        // delete any selected content
        range.deleteContents();

        // insert plain text
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);

        // move cursor to end of inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      }}
      style={{
        width: "auto",
        margin: `${marginVertical}px ${marginHorizontal}px`,
        color: color || themeSettings.colors.text,
        textShadow: `0px 0px 2px rgba(0,0,0,${(shadow || 0) / 100})`,
        fontWeight,
        textAlign,
        fontSize: matches.isMobile && fontSizeMobile ? `${fontSizeMobile}px` : `${fontSize}px`,
      }}
    />
  );
};

EditorText.craft = {
  displayName: "Text",
  props: {
    textAlign: "left",
    fontWeight: "500",
    shadow: 0,
    text: "Text",
  },
  related: {
    toolbar: TextSettings,
  },
};
