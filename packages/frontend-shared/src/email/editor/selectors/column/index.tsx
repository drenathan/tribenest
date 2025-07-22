import selectors from "@tribe-nest/email-selectors";
import { EmailColumnSettings } from "./ColumnSettings";

export const EmailColumn = selectors.EmailColumn;

EmailColumn.craft = {
  displayName: "Column",
  props: {
    height: "100",
  },
  related: {
    toolbar: EmailColumnSettings,
  },
  rules: {
    canDrag: () => false,
  },
};
