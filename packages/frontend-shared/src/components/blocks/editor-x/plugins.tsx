import { useState } from "react";
import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from "@lexical/markdown";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";

import { ContentEditable } from "../../editor/editor-ui/content-editable";
import { ActionsPlugin } from "../../editor/plugins/actions/actions-plugin";
import { ClearEditorActionPlugin } from "../../editor/plugins/actions/clear-editor-plugin";
import { MaxLengthPlugin } from "../../editor/plugins/actions/max-length-plugin";
import { SpeechToTextPlugin } from "../../editor/plugins/actions/speech-to-text-plugin";
import { AutoLinkPlugin } from "../../editor/plugins/auto-link-plugin";
import { CodeActionMenuPlugin } from "../../editor/plugins/code-action-menu-plugin";
import { CodeHighlightPlugin } from "../../editor/plugins/code-highlight-plugin";
import { CollapsiblePlugin } from "../../editor/plugins/collapsible-plugin";
import { ComponentPickerMenuPlugin } from "../../editor/plugins/component-picker-menu-plugin";
import { ContextMenuPlugin } from "../../editor/plugins/context-menu-plugin";
import { DragDropPastePlugin } from "../../editor/plugins/drag-drop-paste-plugin";
import { DraggableBlockPlugin } from "../../editor/plugins/draggable-block-plugin";
import { AutoEmbedPlugin } from "../../editor/plugins/embeds/auto-embed-plugin";
import { FigmaPlugin } from "../../editor/plugins/embeds/figma-plugin";
import { TwitterPlugin } from "../../editor/plugins/embeds/twitter-plugin";
import { YouTubePlugin } from "../../editor/plugins/embeds/youtube-plugin";
import { EmojiPickerPlugin } from "../../editor/plugins/emoji-picker-plugin";
import { EmojisPlugin } from "../../editor/plugins/emojis-plugin";
import { EquationsPlugin } from "../../editor/plugins/equations-plugin";
import { FloatingLinkEditorPlugin } from "../../editor/plugins/floating-link-editor-plugin";
import { FloatingTextFormatToolbarPlugin } from "../../editor/plugins/floating-text-format-plugin";
import { ImagesPlugin } from "../../editor/plugins/images-plugin";
import { InlineImagePlugin } from "../../editor/plugins/inline-image-plugin";
import { KeywordsPlugin } from "../../editor/plugins/keywords-plugin";
import { LayoutPlugin } from "../../editor/plugins/layout-plugin";
import { LinkPlugin } from "../../editor/plugins/link-plugin";
import { ListMaxIndentLevelPlugin } from "../../editor/plugins/list-max-indent-level-plugin";
import { MentionsPlugin } from "../../editor/plugins/mentions-plugin";
import { PageBreakPlugin } from "../../editor/plugins/page-break-plugin";
import { AlignmentPickerPlugin } from "../../editor/plugins/picker/alignment-picker-plugin";
import { BulletedListPickerPlugin } from "../../editor/plugins/picker/bulleted-list-picker-plugin";
import { CheckListPickerPlugin } from "../../editor/plugins/picker/check-list-picker-plugin";
import { DividerPickerPlugin } from "../../editor/plugins/picker/divider-picker-plugin";
import { EmbedsPickerPlugin } from "../../editor/plugins/picker/embeds-picker-plugin";
import { HeadingPickerPlugin } from "../../editor/plugins/picker/heading-picker-plugin";
import { NumberedListPickerPlugin } from "../../editor/plugins/picker/numbered-list-picker-plugin";
import { PageBreakPickerPlugin } from "../../editor/plugins/picker/page-break-picker-plugin";
import { ParagraphPickerPlugin } from "../../editor/plugins/picker/paragraph-picker-plugin";
import { QuotePickerPlugin } from "../../editor/plugins/picker/quote-picker-plugin";
import { DynamicTablePickerPlugin, TablePickerPlugin } from "../../editor/plugins/picker/table-picker-plugin";
import { PollPlugin } from "../../editor/plugins/poll-plugin";
import { TabFocusPlugin } from "../../editor/plugins/tab-focus-plugin";
import { TableActionMenuPlugin } from "../../editor/plugins/table-action-menu-plugin";
import { TableCellResizerPlugin } from "../../editor/plugins/table-cell-resizer-plugin";
import { TableHoverActionsPlugin } from "../../editor/plugins/table-hover-actions-plugin";
import { BlockFormatDropDown } from "../../editor/plugins/toolbar/block-format-toolbar-plugin";
import { FormatBulletedList } from "../../editor/plugins/toolbar/block-format/format-bulleted-list";
import { FormatCheckList } from "../../editor/plugins/toolbar/block-format/format-check-list";
import { FormatCodeBlock } from "../../editor/plugins/toolbar/block-format/format-code-block";
import { FormatHeading } from "../../editor/plugins/toolbar/block-format/format-heading";
import { FormatNumberedList } from "../../editor/plugins/toolbar/block-format/format-numbered-list";
import { FormatParagraph } from "../../editor/plugins/toolbar/block-format/format-paragraph";
import { FormatQuote } from "../../editor/plugins/toolbar/block-format/format-quote";
import { BlockInsertPlugin } from "../../editor/plugins/toolbar/block-insert-plugin";
import { InsertCollapsibleContainer } from "../../editor/plugins/toolbar/block-insert/insert-collapsible-container";
import { InsertEmbeds } from "../../editor/plugins/toolbar/block-insert/insert-embeds";
import { InsertHorizontalRule } from "../../editor/plugins/toolbar/block-insert/insert-horizontal-rule";
import { InsertPageBreak } from "../../editor/plugins/toolbar/block-insert/insert-page-break";
import { InsertTable } from "../../editor/plugins/toolbar/block-insert/insert-table";
import { ClearFormattingToolbarPlugin } from "../../editor/plugins/toolbar/clear-formatting-toolbar-plugin";
import { CodeLanguageToolbarPlugin } from "../../editor/plugins/toolbar/code-language-toolbar-plugin";
import { ElementFormatToolbarPlugin } from "../../editor/plugins/toolbar/element-format-toolbar-plugin";
import { FontColorToolbarPlugin } from "../../editor/plugins/toolbar/font-color-toolbar-plugin";
import { FontFormatToolbarPlugin } from "../../editor/plugins/toolbar/font-format-toolbar-plugin";
import { FontSizeToolbarPlugin } from "../../editor/plugins/toolbar/font-size-toolbar-plugin";
import { HistoryToolbarPlugin } from "../../editor/plugins/toolbar/history-toolbar-plugin";
import { LinkToolbarPlugin } from "../../editor/plugins/toolbar/link-toolbar-plugin";
import { ToolbarPlugin } from "../../editor/plugins/toolbar/toolbar-plugin";
import { EMOJI } from "../../editor/transformers/markdown-emoji-transformer";
import { EQUATION } from "../../editor/transformers/markdown-equation-transformer";
import { HR } from "../../editor/transformers/markdown-hr-transformer";
import { IMAGE } from "../../editor/transformers/markdown-image-transformer";
import { TABLE } from "../../editor/transformers/markdown-table-transformer";
import { TWEET } from "../../editor/transformers/markdown-tweet-transformer";
import { Separator } from "../../ui/separator";

const placeholder = "Press / for commands...";
const maxLength = 500;

export function Plugins({ height = "500px" }: { height?: string }) {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
  const heightClass = `h-[${height}]`;

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <div className="relative">
      <ToolbarPlugin>
        {({ blockType }) => (
          <div className="vertical-align-middle sticky top-0 z-10 flex gap-2 overflow-auto border-b p-1">
            <HistoryToolbarPlugin />
            <Separator orientation="vertical" className="h-8" />
            <BlockFormatDropDown>
              <FormatParagraph />
              <FormatHeading levels={["h1", "h2", "h3"]} />
              <FormatNumberedList />
              <FormatBulletedList />
              <FormatCheckList />
              <FormatCodeBlock />
              <FormatQuote />
            </BlockFormatDropDown>
            {blockType === "code" ? (
              <CodeLanguageToolbarPlugin />
            ) : (
              <>
                {/* <FontFamilyToolbarPlugin /> */}
                <FontSizeToolbarPlugin />
                <Separator orientation="vertical" className="h-8" />
                <FontFormatToolbarPlugin format="bold" />
                <FontFormatToolbarPlugin format="italic" />
                <FontFormatToolbarPlugin format="underline" />
                <FontFormatToolbarPlugin format="strikethrough" />
                <Separator orientation="vertical" className="h-8" />
                {/* <SubSuperToolbarPlugin /> */}
                <LinkToolbarPlugin />
                <Separator orientation="vertical" className="h-8" />
                <ClearFormattingToolbarPlugin />
                <Separator orientation="vertical" className="h-8" />
                <FontColorToolbarPlugin />
                {/* <FontBackgroundToolbarPlugin /> */}
                <Separator orientation="vertical" className="h-8" />
                <ElementFormatToolbarPlugin />
                <Separator orientation="vertical" className="h-8" />
                <BlockInsertPlugin>
                  <InsertHorizontalRule />
                  <InsertPageBreak />
                  {/* <InsertImage /> */}
                  {/* <InsertInlineImage /> */}
                  <InsertCollapsibleContainer />
                  {/* <InsertExcalidraw /> */}
                  <InsertTable />
                  {/* <InsertPoll /> */}
                  {/* <InsertColumnsLayout /> */}
                  <InsertEmbeds />
                </BlockInsertPlugin>
              </>
            )}
          </div>
        )}
      </ToolbarPlugin>
      <div className="relative">
        <AutoFocusPlugin />
        <RichTextPlugin
          contentEditable={
            <div className="">
              <div className="" ref={onRef}>
                <ContentEditable
                  placeholder={placeholder}
                  className={`ContentEditable__root relative block overflow-auto px-8 py-4 focus:outline-none ${heightClass}`}
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <ClickableLinkPlugin />
        <CheckListPlugin />
        <HorizontalRulePlugin />
        <TablePlugin />
        <ListPlugin />
        <TabIndentationPlugin />
        <HashtagPlugin />
        <HistoryPlugin />

        {/* <MentionsPlugin /> */}
        <PageBreakPlugin />
        <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
        <KeywordsPlugin />
        <EmojisPlugin />
        <ImagesPlugin />
        <InlineImagePlugin />
        {/* <ExcalidrawPlugin /> */}
        <TableCellResizerPlugin />
        <TableHoverActionsPlugin anchorElem={floatingAnchorElem} />
        <TableActionMenuPlugin anchorElem={floatingAnchorElem} cellMerge={true} />
        <PollPlugin />
        <LayoutPlugin />
        <EquationsPlugin />
        <CollapsiblePlugin />

        <AutoEmbedPlugin />
        <FigmaPlugin />
        <TwitterPlugin />
        <YouTubePlugin />

        <CodeHighlightPlugin />
        <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />

        <MarkdownShortcutPlugin
          transformers={[
            TABLE,
            HR,
            IMAGE,
            EMOJI,
            EQUATION,
            TWEET,
            CHECK_LIST,
            ...ELEMENT_TRANSFORMERS,
            ...MULTILINE_ELEMENT_TRANSFORMERS,
            ...TEXT_FORMAT_TRANSFORMERS,
            ...TEXT_MATCH_TRANSFORMERS,
          ]}
        />
        {/* <TypingPerfPlugin /> */}
        <TabFocusPlugin />
        {/* <AutocompletePlugin /> */}
        <AutoLinkPlugin />
        <LinkPlugin />

        <ComponentPickerMenuPlugin
          baseOptions={[
            ParagraphPickerPlugin(),
            HeadingPickerPlugin({ n: 1 }),
            HeadingPickerPlugin({ n: 2 }),
            HeadingPickerPlugin({ n: 3 }),
            TablePickerPlugin(),
            CheckListPickerPlugin(),
            NumberedListPickerPlugin(),
            BulletedListPickerPlugin(),
            QuotePickerPlugin(),
            // CodePickerPlugin(),
            DividerPickerPlugin(),
            PageBreakPickerPlugin(),
            // ExcalidrawPickerPlugin(),
            // PollPickerPlugin(),
            // EmbedsPickerPlugin({ embed: "figma" }),
            EmbedsPickerPlugin({ embed: "tweet" }),
            EmbedsPickerPlugin({ embed: "youtube-video" }),
            // EquationPickerPlugin(),
            // ImagePickerPlugin(),
            // CollapsiblePickerPlugin(),
            // ColumnsLayoutPickerPlugin(),
            AlignmentPickerPlugin({ alignment: "left" }),
            AlignmentPickerPlugin({ alignment: "center" }),
            AlignmentPickerPlugin({ alignment: "right" }),
            AlignmentPickerPlugin({ alignment: "justify" }),
          ]}
          dynamicOptionsFn={DynamicTablePickerPlugin}
        />

        <ContextMenuPlugin />
        <DragDropPastePlugin />
        {/* <EmojiPickerPlugin /> */}

        <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
        <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />

        <ListMaxIndentLevelPlugin />
      </div>
      <ActionsPlugin>
        <div className="clear-both flex items-center justify-between gap-2 overflow-auto border-t p-1">
          <div className="flex flex-1 justify-start">
            <MaxLengthPlugin maxLength={maxLength} />
            {/* <CharacterLimitPlugin maxLength={maxLength} charset="UTF-16" /> */}
          </div>
          {/* <div>
            <CounterCharacterPlugin charset="UTF-16" />
          </div> */}
          <div className="flex flex-1 justify-end">
            <SpeechToTextPlugin />
            {/* <ShareContentPlugin />
            <ImportExportPlugin /> */}
            {/* <MarkdownTogglePlugin
              shouldPreserveNewLinesInMarkdown={true}
              transformers={[
                TABLE,
                HR,
                IMAGE,
                EMOJI,
                EQUATION,
                TWEET,
                CHECK_LIST,
                ...ELEMENT_TRANSFORMERS,
                ...MULTILINE_ELEMENT_TRANSFORMERS,
                ...TEXT_FORMAT_TRANSFORMERS,
                ...TEXT_MATCH_TRANSFORMERS,
              ]}
            /> */}
            {/* <EditModeTogglePlugin /> */}
            <>
              <ClearEditorActionPlugin />
              <ClearEditorPlugin />
            </>
            {/* <TreeViewPlugin /> */}
          </div>
        </div>
      </ActionsPlugin>
    </div>
  );
}
