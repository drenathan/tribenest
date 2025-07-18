"use client";
import { type UserComponent, useNode } from "@craftjs/core";
import { useEffect } from "react";
import { useEditorContext } from "../../context";
import { ButtonSettings } from "./ButtonSettings";
import { css } from "@emotion/css";
import type { EditorTheme } from "../../../../types";
import { alphaToHexCode } from "../../../../lib/utils";

type ButtonProps = {
  background?: string;
  color?: string;
  buttonStyle?: string;
  marginHorizontal?: string;
  marginVertical?: string;
  text?: string;
  onClick?: () => void;
  fullWidth?: boolean;
  shouldConnect?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

const buttonStyles = (themeSettings: EditorTheme, fullWidth?: boolean, variant: "primary" | "secondary" = "primary") =>
  css({
    backgroundColor: variant === "primary" ? themeSettings.colors.primary : themeSettings.colors.background,
    color: variant === "primary" ? themeSettings.colors.textPrimary : themeSettings.colors.primary,
    paddingRight: "20px",
    paddingLeft: "20px",
    paddingTop: "10px",
    paddingBottom: "10px",
    borderRadius: `${themeSettings.cornerRadius}px`,
    fontFamily: themeSettings.fontFamily,
    fontSize: "16px",
    textAlign: "center",
    cursor: "pointer",
    width: fullWidth ? "100%" : "auto",
    transition: "background-color 0.3s ease",
    border: `1px solid ${themeSettings.colors.primary + alphaToHexCode(0.3)}`,

    "&:hover": {
      ...(variant === "primary"
        ? { backgroundColor: themeSettings.colors.primary + alphaToHexCode(0.8) }
        : {
            border: `1px solid ${themeSettings.colors.primary}`,
            color: themeSettings.colors.primary,
            transition: "all 0.3s ease",
          }),
    },
    "&:disabled": {
      backgroundColor:
        variant === "primary" ? themeSettings.colors.primary + alphaToHexCode(0.5) : themeSettings.colors.background,
      cursor: "not-allowed",
    },
  });

export const EditorButton: UserComponent<ButtonProps> = ({
  text,
  fullWidth,
  onClick,
  shouldConnect = true,
  type = "button",
  disabled = false,
  variant = "primary",
}: ButtonProps) => {
  const { themeSettings } = useEditorContext();
  const {
    connectors: { connect },
    actions: { setProp },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  useEffect(() => {
    setProp((prop: ButtonProps) => {
      prop.color = themeSettings.colors.textPrimary;
      prop.background = themeSettings.colors.primary;
    });
  }, [themeSettings, setProp]);

  return (
    <button
      ref={(dom) => {
        if (!dom) return;
        if (shouldConnect) {
          connect(dom);
        }
      }}
      onClick={onClick}
      className={buttonStyles(themeSettings, fullWidth, variant)}
      type={type}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

EditorButton.craft = {
  displayName: "Button",
  props: {
    text: "Button",
  },
  related: {
    toolbar: ButtonSettings,
  },
};

export const EditorButtonWithoutEditor = ({ text, onClick, fullWidth, type, disabled, variant }: ButtonProps) => {
  const { themeSettings } = useEditorContext();

  return (
    <button
      onClick={onClick}
      className={buttonStyles(themeSettings, fullWidth, variant)}
      type={type}
      disabled={disabled}
    >
      {text}
    </button>
  );
};
