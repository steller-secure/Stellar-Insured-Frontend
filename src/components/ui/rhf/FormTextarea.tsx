"use client";

import React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { useController } from "react-hook-form";
import { Textarea } from "@/components/ui/Textarea";

export interface FormTextareaProps<T extends FieldValues>
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
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

export function FormTextarea<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  required,
  id,
  className,
  ...props
}: FormTextareaProps<T>) {
  const { field, fieldState } = useController({ name, control });

  const fieldId = id ?? name;
  const showError = fieldState.isTouched && !!fieldState.error;

  return (
    <Textarea
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