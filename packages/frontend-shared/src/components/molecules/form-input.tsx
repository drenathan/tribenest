"use client";
import { FormError } from "../ui/form-error";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { type FieldValues, useController, type UseControllerProps } from "react-hook-form";
import { Textarea } from "../ui/textarea";

type Props = {
  className?: string;
  label?: string;
  type?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  textArea?: boolean;
  min?: number;
};

export function FormInput<T extends FieldValues>(props: UseControllerProps<T> & Props) {
  const { field, fieldState } = useController(props);

  return (
    <div className={`${props.className}`}>
      {props.label && (
        <Label className="mb-2 block" htmlFor={field.name}>
          {props.label}
        </Label>
      )}

      {props.textArea ? (
        <Textarea
          {...field}
          placeholder={props.placeholder}
          onChange={(e) => {
            field.onChange(e);
            props.onChange?.(e.target.value);
          }}
        />
      ) : (
        <Input
          {...field}
          type={props.type}
          placeholder={props.placeholder}
          onChange={(e) => {
            field.onChange(e);
            props.onChange?.(e.target.value);
          }}
          min={props.min}
        />
      )}

      {fieldState.error?.message && <FormError message={fieldState.error.message} />}
    </div>
  );
}
