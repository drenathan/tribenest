import selectors from "@tribe-nest/email-selectors";
import { TextSettings } from "./TextSettings";

export const EmailText = selectors.EmailText;
EmailText.craft = {
  displayName: "Text",
  props: {
    text: `<h1 dir="ltr"><span style="font-size: 21px; white-space: pre-wrap;">Text</span></h1><p><br></p><h1 dir="ltr"><u><s><i><b><code spellcheck="false" style="font-size: 28px; white-space: pre-wrap;"><strong>hhgj</strong></code></b></i></s></u></h1><p dir="ltr"><span style="font-size: 26px; white-space: pre-wrap;">dweasdf</span></p>`,
  },
  related: {
    toolbar: TextSettings,
  },
};
