import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { OverflowNode } from "@lexical/overflow";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { type Klass, type LexicalNode, type LexicalNodeReplacement, ParagraphNode, TextNode } from "lexical";

import { AutocompleteNode } from "../../editor/nodes/autocomplete-node";
import { CollapsibleContainerNode } from "../../editor/nodes/collapsible-container-node";
import { CollapsibleContentNode } from "../../editor/nodes/collapsible-content-node";
import { CollapsibleTitleNode } from "../../editor/nodes/collapsible-title-node";
import { FigmaNode } from "../../editor/nodes/embeds/figma-node";
import { TweetNode } from "../../editor/nodes/embeds/tweet-node";
import { YouTubeNode } from "../../editor/nodes/embeds/youtube-node";
import { EmojiNode } from "../../editor/nodes/emoji-node";
import { EquationNode } from "../../editor/nodes/equation-node";
import { ExcalidrawNode } from "../../editor/nodes/excalidraw-node";
import { ImageNode } from "../../editor/nodes/image-node";
import { InlineImageNode } from "../../editor/nodes/inline-image-node";
import { KeywordNode } from "../../editor/nodes/keyword-node";
import { LayoutContainerNode } from "../../editor/nodes/layout-container-node";
import { LayoutItemNode } from "../../editor/nodes/layout-item-node";
import { MentionNode } from "../../editor/nodes/mention-node";
import { PageBreakNode } from "../../editor/nodes/page-break-node";
import { PollNode } from "../../editor/nodes/poll-node";
import { ExtendedTextNode } from "../../editor/nodes/extended-text-node";

export const nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> = [
  HeadingNode,
  ParagraphNode,
  TextNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  OverflowNode,
  HashtagNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  CodeNode,
  CodeHighlightNode,
  HorizontalRuleNode,
  MentionNode,
  PageBreakNode,
  ImageNode,
  InlineImageNode,
  EmojiNode,
  KeywordNode,
  ExcalidrawNode,
  PollNode,
  LayoutContainerNode,
  LayoutItemNode,
  EquationNode,
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
  AutoLinkNode,
  FigmaNode,
  TweetNode,
  YouTubeNode,
  AutocompleteNode,
  ExtendedTextNode,
  {
    replace: TextNode,
    with: (node: TextNode) => new ExtendedTextNode(node.__text),
    withKlass: ExtendedTextNode,
  },
];
