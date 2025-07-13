"use client";
import { FormError } from "../ui/form-error";
import { Label } from "../ui/label";
import { type FieldValues, useController, type UseControllerProps } from "react-hook-form";
import { MultiSelect } from "../ui/multi-select";

type Props = {
  className?: string;
  label?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  choices: { label: string; value: string }[];
  key?: string;
  defaultValue?: string[];
};

export function FormMultiSelect<T extends FieldValues>(props: UseControllerProps<T> & Props) {
  const { field, fieldState } = useController(props);

  return (
    <div className={`${props.className}`} key={props.key}>
      {props.label && (
        <Label className="mb-4 block" htmlFor={field.name}>
          {props.label}
        </Label>
      )}
      <MultiSelect
        options={props.choices}
        defaultValue={props.defaultValue ?? []}
        onValueChange={field.onChange}
        placeholder={props.placeholder}
        value={field.value}
        variant="default"
        animation={2}
        maxCount={3}
      />

      {fieldState.error?.message && <FormError message={fieldState.error.message} />}
    </div>
  );
}
