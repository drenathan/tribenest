import selectors from "@tribe-nest/email-selectors";
import { TextSettings } from "./TextSettings";

export const EmailText = selectors.EmailText;
EmailText.craft = {
  displayName: "Text",
  props: {
    text: `Click here and edit the content from the right side panel`,
  },
  related: {
    toolbar: TextSettings,
  },
};
