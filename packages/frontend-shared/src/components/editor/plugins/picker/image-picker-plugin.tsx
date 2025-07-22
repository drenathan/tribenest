import { ImageIcon } from "lucide-react";

import { InsertImageDialog } from "../../plugins/images-plugin";
import { ComponentPickerOption } from "./component-picker-option";

export function ImagePickerPlugin() {
  return new ComponentPickerOption("Image", {
    icon: <ImageIcon className="size-4" />,
    keywords: ["image", "photo", "picture", "file"],
    onSelect: (_, editor, showModal) =>
      showModal("Insert Image", (onClose) => <InsertImageDialog activeEditor={editor} onClose={onClose} />),
  });
}
