"use client";
import { FormError } from "../ui/form-error";
import { Label } from "../ui/label";
import { type FieldValues, useController, type UseControllerProps } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type Props = {
  className?: string;
  label?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  choices: { label: string; value: string }[];
};

export function FormSelect<T extends FieldValues>(props: UseControllerProps<T> & Props) {
  const { field, fieldState } = useController(props);

  return (
    <div className={`${props.className}`}>
      {props.label && (
        <Label className="mb-4 block" htmlFor={field.name}>
          {props.label}
        </Label>
      )}
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={props.placeholder} />
        </SelectTrigger>
        <SelectContent className="w-full">
          {props.choices.map((choice) => (
            <SelectItem key={choice.value} value={choice.value}>
              {choice.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {fieldState.error?.message && <FormError message={fieldState.error.message} />}
    </div>
  );
}
