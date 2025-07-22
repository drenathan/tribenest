import { FrameIcon } from "lucide-react";

import { INSERT_EXCALIDRAW_COMMAND } from "../../plugins/excalidraw-plugin";
import { ComponentPickerOption } from "./component-picker-option";

export function ExcalidrawPickerPlugin() {
  return new ComponentPickerOption("Excalidraw", {
    icon: <FrameIcon className="size-4" />,
    keywords: ["excalidraw", "diagram", "drawing"],
    onSelect: (_, editor) => editor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined),
  });
}
