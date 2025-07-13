"use client";
import { Label } from "../../ui/label";
import { RadioGroupItem } from "../../ui/radio-group";

export const ToolbarRadio = ({ value, label }: any) => {
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value={value} id="r1" />
      <Label htmlFor={value}>{label}</Label>
    </div>
  );
};
