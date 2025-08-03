"use client";
import { type UserComponent, useNode } from "@craftjs/core";
import { useEditorContext } from "../../context";
import { EditorFooterSettings } from "./Settings";
import { addAlphaToHexCode } from "../../../../lib/utils";
import { EditorSocialIcons } from "../SocialIcons";

type EditorFooterProps = {};

export const EditorFooter: UserComponent<EditorFooterProps> = () => {
  const { profile, themeSettings } = useEditorContext();

  const {
    connectors: { connect },
  } = useNode();

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(ref);
        }
      }}
      className="w-full @md:px-8 px-4 py-12"
      style={{
        backgroundColor: themeSettings.colors.background,
        color: themeSettings.colors.text,
        borderTop: `1px solid ${addAlphaToHexCode(themeSettings.colors.primary, 0.3)}`,
      }}
    >
      <div className="flex justify-between items-center @md:flex-row flex-col gap-4">
        <p>
          &copy; {new Date().getFullYear()} {profile?.name}
        </p>
        <EditorSocialIcons />
      </div>

      <div
        className="flex justify-center items-center mt-6"
        style={{
          color: addAlphaToHexCode(themeSettings.colors.text, 0.5),
        }}
      >
        <a href="https://www.tribenest.co" target="_blank" rel="noopener noreferrer" className="hover:underline">
          Powered by TribeNest
        </a>
      </div>
    </div>
  );
};

EditorFooter.craft = {
  displayName: "Footer",
  custom: {
    preventDelete: true,
  },
  related: {
    toolbar: EditorFooterSettings,
  },
};
