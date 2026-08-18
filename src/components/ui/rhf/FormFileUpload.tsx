"use client";

import React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { useController } from "react-hook-form";
import { FileUpload } from "@/components/ui/FileUpload";

export interface FormFileUploadProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  accept?: string;
}

export function FormFileUpload<T extends FieldValues>({
  name,
  control,
  label,
  accept,
}: FormFileUploadProps<T>) {
  const { field, fieldState } = useController({ name, control });

  return (
    <FileUpload
      label={label}
      accept={accept}
      onChange={(file) => field.onChange(file)}
      error={fieldState.error ? fieldState.error.message : undefined}
    />
  );
}