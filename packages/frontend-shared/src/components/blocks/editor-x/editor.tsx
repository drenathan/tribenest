import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { type EditorState, type SerializedEditorState } from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CLEAR_HISTORY_COMMAND, $getRoot } from "lexical";
import { useLayoutEffect } from "react";
import { FloatingLinkContext } from "../../editor/context/floating-link-context";
import { SharedAutocompleteContext } from "../../editor/context/shared-autocomplete-context";
import { TooltipProvider } from "../../ui/tooltip";

import { nodes } from "./nodes";
import { Plugins } from "./plugins";

const theme = {};
function onError(error: Error) {
  console.error(error);
}

const initialConfig = {
  namespace: "MyEditor",
  nodes,
  theme,
  onError,
};

export function Editor({
  onChange,
  onSerializedChange,
  initHtml,
  onHtmlChange,
}: {
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
  initHtml: string;
  onHtmlChange?: (html: string) => void;
}) {
  return (
    <div className="bg-background overflow-hidden rounded-lg border shadow text-foreground">
      <LexicalComposer initialConfig={initialConfig}>
        <TooltipProvider>
          <SharedAutocompleteContext>
            <FloatingLinkContext>
              <Plugins />
              <SetInitialValuePlugin initHtml={initHtml} />
              <OnChangePlugin
                ignoreSelectionChange={true}
                onChange={(editorState) => {
                  onChange?.(editorState);
                  onSerializedChange?.(editorState.toJSON());
                }}
              />
              <HtmlConverterPlugin onHtmlChange={onHtmlChange} />
            </FloatingLinkContext>
          </SharedAutocompleteContext>
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}

export const SetInitialValuePlugin: React.FC<{ initHtml: string }> = ({ initHtml = "" }) => {
  const [editor] = useLexicalComposerContext();

  useLayoutEffect(() => {
    if (editor && initHtml) {
      editor.update(() => {
        const content = $generateHtmlFromNodes(editor, null);

        if (!!initHtml && content !== initHtml) {
          const parser = new DOMParser();
          const dom = parser.parseFromString(initHtml, "text/html");
          const nodes = $generateNodesFromDOM(editor, dom);

          const root = $getRoot();
          root.clear();

          const selection = root.select();
          selection.removeText();
          selection.insertNodes(nodes);
          editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
        }
      });
    }
  }, [initHtml, editor]);

  return null;
};

const HtmlConverterPlugin: React.FC<{ onHtmlChange?: (html: string) => void }> = ({ onHtmlChange }) => {
  const [editor] = useLexicalComposerContext();

  useLayoutEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editor, null);
        onHtmlChange?.(htmlString);
      });
    });
  }, [editor, onHtmlChange]);

  return null;
};
