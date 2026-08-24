"use client";

import React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { useController } from "react-hook-form";
import { Select } from "@/components/ui/Select";

export interface FormSelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps<T extends FieldValues>
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "name" | "onChange" | "onBlur" | "value" | "defaultValue" | "id" | "size"
  > {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: FormSelectOption[];
  placeholder?: string;
  required?: boolean;
  /** Overrides the auto-generated control id (defaults to `name`) */
  id?: string;
  className?: string;
}

export function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder,
  required,
  id,
  className,
  ...props
}: FormSelectProps<T>) {
  const { field, fieldState } = useController({ name, control });

  const fieldId = id ?? name;
  const showError = fieldState.isTouched && !!fieldState.error;

  return (
    <Select
      {...props}
      {...field}
      id={fieldId}
      label={label}
      options={options}
      placeholder={placeholder}
      required={required}
      error={showError ? fieldState.error?.message : undefined}
      className={className}
    />
  );
}