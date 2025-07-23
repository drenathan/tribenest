import { EmailColumn } from "./column";
import { EmailSection } from "./section";
import { EmailText } from "./text";
import { EmailContainer } from "./container";
import { EmailImage } from "./image";
import { EmailButton } from "./button";

export * from "./column";
export * from "./text";
export * from "./container";
export * from "./section";
export * from "./image";
export * from "./button";

export const emailEditorResolvers = {
  EmailColumn,
  EmailText,
  EmailSection,
  EmailContainer,
  EmailImage,
  EmailButton,
};
