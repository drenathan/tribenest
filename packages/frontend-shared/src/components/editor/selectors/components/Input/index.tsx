"use client";
import { type UserComponent } from "@craftjs/core";
import { useContainerQueryContext, useEditorContext } from "../../../context";
import { css } from "@emotion/css";
import { alphaToHexCode } from "../../../../../lib/utils";
import type { HTMLInputTypeAttribute } from "react";

type InputProps = {
  placeholder?: string;
  onChange?: (value: string) => void;
  shouldConnect?: boolean;
  width?: string;
  widthMobile?: string;
  type?: HTMLInputTypeAttribute;
  value?: string;
  min?: number;
  max?: number;
  className?: string;
};

export const EditorInput: UserComponent<InputProps> = ({
  onChange,
  shouldConnect = true,
  placeholder,
  width,
  widthMobile,
  type,
  value,
}: InputProps) => {
  return (
    <Input
      placeholder={placeholder}
      onChange={onChange}
      shouldConnect={shouldConnect}
      width={width}
      widthMobile={widthMobile}
      type={type}
      value={value}
    />
  );
};

EditorInput.craft = {
  displayName: "Input",
  props: {
    width: "100%",
    widthMobile: "100%",
  },
  related: {
    toolbar: () => <div></div>,
  },
};

export const EditorInputWithoutEditor = ({
  placeholder,
  onChange,
  shouldConnect = true,
  width,
  widthMobile,
  type,
  value,
  min,
  max,
}: InputProps) => {
  return (
    <Input
      min={min}
      max={max}
      placeholder={placeholder}
      onChange={onChange}
      shouldConnect={shouldConnect}
      width={width}
      widthMobile={widthMobile}
      type={type}
      value={value}
    />
  );
};

const Input = ({
  placeholder,
  onChange,
  width,
  widthMobile,
  ref,
  type,
  value,
  min,
  max,
}: InputProps & { ref?: React.RefObject<HTMLInputElement> }) => {
  const { themeSettings } = useEditorContext();
  const {
    matches: { isMobile },
  } = useContainerQueryContext();

  return (
    <input
      ref={ref}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      type={type}
      value={value}
      min={min}
      max={max}
      className={css`
        background-color: ${themeSettings.colors.background};
        color: ${themeSettings.colors.text};
        border: 2px solid ${themeSettings.colors.primary}${alphaToHexCode(0.65)};
        border-radius: ${themeSettings.cornerRadius}px;
        padding: 10px;
        width: ${isMobile && widthMobile ? widthMobile : width};
        font-size: 16px;
        outline: none;
        transition: border-color 0.3s ease;

        &:focus {
          border-color: ${themeSettings.colors.primary};
        }

        &::placeholder {
          color: ${themeSettings.colors.textPrimary}${alphaToHexCode(0.45)};
        }
      `}
    />
  );
};
