"use client";
import { useEditor } from "@craftjs/core";
import cx from "classnames";
import React, { useRef } from "react";
import { Sidebar } from "./Sidebar";
import { Toolbox } from "./Toolbox";
import { cn } from "../../../lib/utils";
import { ContainerQueryProvider } from "../context";

export const Viewport: React.FC<{ children?: React.ReactNode; isMobile: boolean; isPreview?: boolean }> = ({
  children,
  isMobile,
  isPreview,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const { enabled, connectors } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return (
    <ContainerQueryProvider ref={ref}>
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
                ref={ref}
                className={cn("relative overflow-y-auto transition-all duration-300 ease-in-out @container", {
                  "h-[calc(100vh-120px)]": !isMobile,
                  "h-[800px]": isMobile,
                  "w-[375px]": isMobile,
                  "w-full": !isMobile,
                })}
              >
                {children}
              </div>
            </div>
          </div>
          {!isPreview && enabled && <Sidebar />}
        </div>
      </div>
    </ContainerQueryProvider>
  );
};
