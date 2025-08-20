import selectors from "@tribe-nest/email-selectors";
import { TextSettings } from "./TextSettings";

export const EmailText = selectors.EmailText;
EmailText.craft = {
  displayName: "Text",
  props: {
    text: `<p dir="ltr"><span style="font-size: 18px; white-space: pre-wrap;">Click here and edit the content from the right side panel</span></p>`,
  },
  related: {
    toolbar: TextSettings,
  },
};
