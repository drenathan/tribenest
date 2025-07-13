"use client";
import * as React from "react";
import { useState } from "react";
import { ChromePicker } from "react-color";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

export type ToolbarTextInputProps = {
  prefix?: string;
  label?: string;
  type: string;
  onChange?: (value: any) => void;
  value?: any;
};
export const ToolbarTextInput = ({ onChange, value, label, type }: ToolbarTextInputProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const [active, setActive] = useState(false);

  React.useEffect(() => {
    setInternalValue(value);
  }, [value, type]);

  return (
    <div
      style={{ width: "100%", position: "relative" }}
      className="text-foreground"
      onClick={() => {
        setActive(true);
      }}
    >
      {(type === "color" || type === "bg") && active ? (
        <div
          className="absolute"
          style={{
            zIndex: 99999,
            top: "calc(100% + 10px)",
            left: "-5%",
          }}
        >
          <div
            className="fixed top-0 left-0 w-full h-full cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActive(false);
            }}
          ></div>
          <ChromePicker
            color={value}
            onChange={(color: any) => {
              onChange?.(color.hex);
            }}
          />
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <Label>{label}</Label>

        <Input
          value={internalValue || ""}
          onChange={(e) => {
            setInternalValue(e.target.value);
            onChange?.(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onChange?.((e.target as any).value);
            }
          }}
        />
      </div>
    </div>
  );
};
