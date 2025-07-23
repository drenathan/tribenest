import selectors from "@tribe-nest/email-selectors";
import { ButtonSettings } from "./ButtonSettings";

export const EmailButton = selectors.EmailButton;

EmailButton.craft = {
  displayName: "Button",
  props: {
    title: "Button",
    link: "https://www.google.com",
  },
  related: {
    toolbar: ButtonSettings,
  },
  rules: {
    canDrag: () => false,
  },
};
