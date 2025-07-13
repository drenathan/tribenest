"use client";
import { FormError } from "../ui/form-error";
import { Label } from "../ui/label";
import { type FieldValues, useController, type UseControllerProps } from "react-hook-form";
import { Checkbox } from "../ui/checkbox";

type Props = {
  className?: string;
  label?: string;
  type?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  textArea?: boolean;
  min?: number;
};

export function FormCheckbox<T extends FieldValues>(props: UseControllerProps<T> & Props) {
  const { field, fieldState } = useController(props);

  return (
    <div className={`${props.className} flex items-center gap-2`}>
      <Checkbox id={field.name} checked={field.value} onCheckedChange={field.onChange} className="cursor-pointer" />
      {props.label && (
        <Label className="cursor-pointer" htmlFor={field.name}>
          {props.label}
        </Label>
      )}

      {fieldState.error?.message && <FormError message={fieldState.error.message} />}
    </div>
  );
}
