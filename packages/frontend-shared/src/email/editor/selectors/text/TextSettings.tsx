import React from "react";

import { ToolbarSection } from "../../../../components/editor";
import { Editor } from "../../../../components/blocks/editor-x/editor";

import { useEditor, useNode } from "@craftjs/core";

export const TextSettings = () => {
  const {
    value,
    actions: { setProp },
    nodeId,
  } = useNode((node) => ({
    value: node.data.props.text,
    nodeId: node.id,
  }));
  const { query } = useEditor();

  return (
    <React.Fragment>
      <ToolbarSection title="Content" props={["text"]} defaultExpanded={true}>
        <div className="h-[500px] w-full">
          <Editor
            initHtml={value}
            onHtmlChange={(html) => {
              const nodes = query.getSerializedNodes();
              if (!nodes[nodeId]) {
                return;
              }
              console.log(html);
              setProp((props: { text: string }) => {
                props.text = html;
              });
            }}
          />
        </div>
      </ToolbarSection>
    </React.Fragment>
  );
};
