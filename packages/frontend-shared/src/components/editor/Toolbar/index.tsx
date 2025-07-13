"use client";
import { useEditor } from "@craftjs/core";
import React from "react";

export * from "./ToolbarItem";
export * from "./ToolbarSection";
export * from "./ToolbarTextInput";
export * from "./ToolbarDropdown";

export const Toolbar = () => {
  const { active, related } = useEditor((state, query) => {
    // TODO: handle multiple selected elements
    const currentlySelectedNodeId = query.getEvent("selected").first();
    return {
      active: currentlySelectedNodeId,
      related: currentlySelectedNodeId && state?.nodes?.[currentlySelectedNodeId]?.related,
    };
  });

  return (
    <div className="py-1 h-full bg-background text-foreground">
      {active && related.toolbar && React.createElement(related.toolbar)}
      {!active && (
        <div className="px-5 py-2 flex flex-col h-full mt-4 text-center">
          <h2 className="pb-1 text-foreground">Click on a component to start editing.</h2>
        </div>
      )}
    </div>
  );
};
