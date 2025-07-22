"use client";
import { useEditor } from "@craftjs/core";
import cx from "classnames";
import React from "react";
import { Sidebar } from "./Sidebar";
import { Toolbox } from "./Toolbox";
import { cn } from "../../../lib/utils";

export const EmailViewport: React.FC<{ children?: React.ReactNode; isMobile: boolean; isPreview?: boolean }> = ({
  children,
  isMobile,
  isPreview,
}) => {
  const { enabled, connectors } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return (
    <div className="viewport">
      <div className={cx(["flex h-full overflow-hidden flex-row w-full fixed"])}>
        {!isPreview && enabled && <Toolbox />}
        <div className="page-container flex flex-1 h-full flex-col">
          <div
            className={cx([
              "craftjs-renderer flex h-full w-full transition py-8 overflow-hidden px-2 justify-center",
              {
                "bg-renderer-gray": enabled,
              },
            ])}
            ref={(ref) => {
              if (ref) {
                connectors.select(connectors.hover(ref, ""), "");
              }
            }}
          >
            <div
              className={cn("relative overflow-y-auto transition-all duration-300 ease-in-out @container", {
                "h-[calc(100vh-120px)]": !isMobile,
                "h-[800px]": isMobile,
                "w-[375px]": isMobile,
                "w-[600px]": !isMobile,
              })}
              style={{ backgroundColor: "white" }}
            >
              {children}
            </div>
          </div>
        </div>
        {!isPreview && enabled && <Sidebar />}
      </div>
    </div>
  );
};
