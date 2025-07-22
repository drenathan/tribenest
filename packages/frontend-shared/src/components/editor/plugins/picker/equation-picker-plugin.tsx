import { DiffIcon } from "lucide-react";

import { InsertEquationDialog } from "../../plugins/equations-plugin";
import { ComponentPickerOption } from "./component-picker-option";

export function EquationPickerPlugin() {
  return new ComponentPickerOption("Equation", {
    icon: <DiffIcon className="size-4" />,
    keywords: ["equation", "latex", "math"],
    onSelect: (_, editor, showModal) =>
      showModal("Insert Equation", (onClose) => <InsertEquationDialog activeEditor={editor} onClose={onClose} />),
  });
}
