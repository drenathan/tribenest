import { EditorButton } from "./Button";
import { Container } from "./Container";
import { MembershipSection } from "./MembershipSection";
import { EditorText } from "./Text";
import { PageHeader } from "./Header";
import { EditorSocialIcons } from "./SocialIcons";
import { EditorIcon } from "./Icon";
import { EditorInput } from "./components/Input";
import { EditorModal } from "./components/Modal";
import { LoadingState } from "./Loading";

export * from "./Container";
export * from "./Text";
export * from "./Button";
export * from "./MembershipSection";
export * from "./Header";
export * from "./SocialIcons";
export * from "./Icon";
export * from "./components/Input";
export * from "./components/Modal";
export * from "./Loading";

export const editorResolver = {
  Container,
  Text: EditorText,
  Button: EditorButton,
  MembershipSection,
  PageHeader,
  EditorSocialIcons,
  EditorIcon,
  EditorInput,
  EditorModal,
  LoadingState,
};
