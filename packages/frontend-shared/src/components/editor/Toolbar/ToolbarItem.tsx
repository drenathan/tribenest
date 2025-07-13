"use client";
import { useNode } from "@craftjs/core";
import { Grid } from "@mui/material";
import * as React from "react";

import { ToolbarDropdown } from "./ToolbarDropdown";
import { ToolbarTextInput } from "./ToolbarTextInput";
import { Label, RadioGroup, Slider } from "@tribe-nest/frontend-shared";
import { SelectImageDialog } from "./SelectMediaDialog";

export type ToolbarItemProps = {
  prefix?: string;
  label?: string;
  full?: boolean;
  propKey: string;
  index?: number;
  children?: React.ReactNode;
  type: "text" | "color" | "bg" | "number" | "slider" | "radio" | "select" | "image";
  onChange?: (value: unknown) => unknown;
};
export const ToolbarItem = ({ full = false, propKey, type, onChange, ...props }: ToolbarItemProps) => {
  const {
    actions: { setProp },
    propValue,
  } = useNode((node) => ({
    propValue: node.data.props[propKey],
  }));
  const value = propValue;

  return (
    <Grid size={{ xs: full ? 12 : 6 }}>
      <div className="mb-2">
        {["text", "color", "bg", "number"].includes(type) && (
          <ToolbarTextInput
            {...props}
            type={type}
            value={value}
            onChange={(value) => {
              setProp((props: any) => {
                props[propKey] = onChange ? onChange(value) : value;
              }, 500);
            }}
          />
        )}
        {type === "slider" && (
          <div className="flex flex-col gap-2">
            {props.label ? <Label>{props.label}</Label> : null}
            <Slider
              defaultValue={[parseInt(value) || 0]}
              onValueChange={([value]) => {
                setProp((props: any) => {
                  props[propKey] = onChange ? onChange(value) : value;
                }, 1000);
              }}
            />
          </div>
        )}
        {type === "radio" && (
          <div className="flex flex-col gap-2">
            {props.label ? <Label>{props.label}</Label> : null}
            <RadioGroup
              defaultValue={value || 0}
              onValueChange={(value) => {
                setProp((props: any) => {
                  props[propKey] = onChange ? onChange(value) : value;
                });
              }}
            >
              {props.children}
            </RadioGroup>
          </div>
        )}
        {type === "select" && (
          <ToolbarDropdown
            value={value || ""}
            onChange={(value: any) => setProp((props: any) => (props[propKey] = onChange ? onChange(value) : value))}
            {...props}
          />
        )}

        {type === "image" && (
          <div>
            <SelectImageDialog
              value={value}
              onImageSelect={(url) => setProp((props: any) => (props[propKey] = url))}
              onRemove={() => setProp((props: any) => (props[propKey] = undefined))}
            />
          </div>
        )}
      </div>
    </Grid>
  );
};
