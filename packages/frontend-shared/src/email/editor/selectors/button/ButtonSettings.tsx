import React from "react";
import { ToolbarSection, ToolbarItem } from "../../../../components/editor/Toolbar";
import type { EmailButtonProps } from "@tribe-nest/email-selectors";

export const ButtonSettings = () => {
  return (
    <React.Fragment>
      <ToolbarSection
        defaultExpanded={true}
        title="Colors"
        props={["backgroundColor", "color"]}
        summary={({ backgroundColor, color }: EmailButtonProps) => {
          return (
            <div className="flex flex-row-reverse">
              <div
                style={{ backgroundColor }}
                className="shadow-md flex-end w-6 h-6 text-center flex items-center rounded-full bg-black"
              >
                <p style={{ color }} className="text-white w-full text-center">
                  T
                </p>
              </div>
            </div>
          );
        }}
      >
        <ToolbarItem full={true} propKey="backgroundColor" type="bg" label="Background Color" />
        <ToolbarItem full={true} propKey="color" type="color" label="Text Color" />
      </ToolbarSection>
      <ToolbarSection defaultExpanded={true} title="Text" props={["title"]}>
        <ToolbarItem full={true} propKey="title" type="text" />
      </ToolbarSection>
      <ToolbarSection defaultExpanded={true} title="Link" props={["link"]}>
        <ToolbarItem full={true} propKey="link" type="text" />
      </ToolbarSection>
    </React.Fragment>
  );
};
