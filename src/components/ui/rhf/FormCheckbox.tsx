"use client";

import React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { useController } from "react-hook-form";
import { Checkbox } from "@/components/ui/Checkbox";

export interface FormCheckboxProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  helperText?: string;
  required?: boolean;
  /** Overrides the auto-generated control id (defaults to `name`) */
  id?: string;
  className?: string;
  disabled?: boolean;
}

export function FormCheckbox<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  required,
  id,
  className,
  disabled,
}: FormCheckboxProps<T>) {
  const { field, fieldState } = useController({ name, control });

  const fieldId = id ?? name;
  const showError = fieldState.isTouched && !!fieldState.error;

  return (
    <Checkbox
      id={fieldId}
      label={label}
      helperText={helperText}
      required={required}
      disabled={disabled}
      className={className}
      checked={!!field.value}
      onBlur={field.onBlur}
      onChange={(event) => field.onChange(event.target.checked)}
      error={showError ? fieldState.error?.message : undefined}
    />
  );
}