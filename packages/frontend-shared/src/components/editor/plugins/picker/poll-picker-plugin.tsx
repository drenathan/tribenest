import { ListChecksIcon } from "lucide-react";

import { ComponentPickerOption } from "./component-picker-option";
import { InsertPollDialog } from "../../plugins/poll-plugin";

export function PollPickerPlugin() {
  return new ComponentPickerOption("Poll", {
    icon: <ListChecksIcon className="size-4" />,
    keywords: ["poll", "vote"],
    onSelect: (_, editor, showModal) =>
      showModal("Insert Poll", (onClose) => <InsertPollDialog activeEditor={editor} onClose={onClose} />),
  });
}
