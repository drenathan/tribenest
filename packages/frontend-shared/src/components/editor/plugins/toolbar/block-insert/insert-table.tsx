"use client";

import { TableIcon } from "lucide-react";

import { useToolbarContext } from "../../../context/toolbar-context";
import { InsertTableDialog } from "../../../plugins/table-plugin";
import { SelectItem } from "../../../../ui/select";

export function InsertTable() {
  const { activeEditor, showModal } = useToolbarContext();

  return (
    <SelectItem
      value="table"
      onPointerUp={() =>
        showModal("Insert Table", (onClose) => <InsertTableDialog activeEditor={activeEditor} onClose={onClose} />)
      }
      className=""
    >
      <div className="flex items-center gap-1">
        <TableIcon className="size-4" />
        <span>Table</span>
      </div>
    </SelectItem>
  );
}
