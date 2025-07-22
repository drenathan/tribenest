import React, { useState } from "react";

import { ToolbarItem, ToolbarSection } from "../../../../components/editor";
import type { SerializedEditorState } from "lexical";
import { Editor } from "../../../../components/blocks/editor-x/editor";

import { useNode } from "@craftjs/core";

export const TextSettings = () => {
  const [editorState, setEditorState] = useState<SerializedEditorState>();
  const {
    value,
    actions: { setProp },
  } = useNode((node) => ({
    value: node.data.props.text,
  }));

  console.log("value", value);

  return (
    <React.Fragment>
      <ToolbarSection title="Content" props={["text"]} defaultExpanded={true}>
        <div className="h-[500px] w-full">
          <Editor
            initHtml={value}
            onHtmlChange={(html) => {
              console.log("html", html);
              setProp((props: any) => {
                props.text = html;
              });
            }}
          />
        </div>
      </ToolbarSection>
    </React.Fragment>
  );
};
