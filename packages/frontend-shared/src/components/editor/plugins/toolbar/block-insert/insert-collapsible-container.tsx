"use client";

import { ChevronRightIcon } from "lucide-react";

import { useToolbarContext } from "../../../context/toolbar-context";
import { INSERT_COLLAPSIBLE_COMMAND } from "../../../plugins/collapsible-plugin";
import { SelectItem } from "../../../../ui/select";

export function InsertCollapsibleContainer() {
  const { activeEditor } = useToolbarContext();
  return (
    <SelectItem
      value="collapsible"
      onPointerUp={() => activeEditor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined)}
      className=""
    >
      <div className="flex items-center gap-1">
        <ChevronRightIcon className="size-4" />
        <span>Collapsible container</span>
      </div>
    </SelectItem>
  );
}
