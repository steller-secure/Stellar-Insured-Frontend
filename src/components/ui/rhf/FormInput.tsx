"use client";

import React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { useController } from "react-hook-form";
import { Input } from "@/components/ui/Input";

export interface FormInputProps<T extends FieldValues>
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "name" | "onChange" | "onBlur" | "value" | "defaultValue" | "id"
  > {
  name: Path<T>;
  control: Control<T>;
  label: string;
  helperText?: string;
  required?: boolean;
  /** Overrides the auto-generated control id (defaults to `name`) */
  id?: string;
  className?: string;
}

export function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  required,
  id,
  className,
  ...props
}: FormInputProps<T>) {
  const { field, fieldState } = useController({ name, control });

  const fieldId = id ?? name;
  const showError = fieldState.isTouched && !!fieldState.error;

  return (
    <Input
      {...props}
      {...field}
      id={fieldId}
      label={label}
      helperText={helperText}
      required={required}
      error={showError ? fieldState.error?.message : undefined}
      className={className}
    />
  );
}