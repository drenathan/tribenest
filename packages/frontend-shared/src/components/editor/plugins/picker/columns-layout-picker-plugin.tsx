import { Columns3Icon } from "lucide-react";

import { InsertLayoutDialog } from "../../plugins/layout-plugin";
import { ComponentPickerOption } from "./component-picker-option";

export function ColumnsLayoutPickerPlugin() {
  return new ComponentPickerOption("Columns Layout", {
    icon: <Columns3Icon className="size-4" />,
    keywords: ["columns", "layout", "grid"],
    onSelect: (_, editor, showModal) =>
      showModal("Insert Columns Layout", (onClose) => <InsertLayoutDialog activeEditor={editor} onClose={onClose} />),
  });
}
