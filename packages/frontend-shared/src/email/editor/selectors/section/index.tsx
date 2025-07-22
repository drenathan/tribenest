import selectors from "@tribe-nest/email-selectors";
import { SectionSettings } from "./SectionSettings";

export type EmailSectionProps = {
  numberOfColumns: number;
  children?: React.ReactNode;
  height?: string;
};

export const EmailSection = selectors.EmailSection;

EmailSection.craft = {
  displayName: "Section",
  props: {
    height: "100px",
    numberOfColumns: 1,
  },
  related: {
    toolbar: SectionSettings,
  },
};
