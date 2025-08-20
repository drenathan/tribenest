import selectors from "@tribe-nest/email-selectors";
import { EmailImageSettings } from "./EmailImageSettings";

export const EmailImage = selectors.EmailImage;

EmailImage.craft = {
  displayName: "Image",
  props: {
    src: "",
    width: "100%",
    height: "200px",
  },
  related: {
    toolbar: EmailImageSettings,
  },
};
