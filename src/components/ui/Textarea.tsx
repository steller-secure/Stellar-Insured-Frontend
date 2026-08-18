import React, { forwardRef, useId } from "react";
import {
  cn,
  controlMotion,
  disabledControl,
  fieldSizeRecipe,
  fieldStateRecipe,
} from "@/design-system";
import type { UIFieldSize } from "@/design-system";
import {
  ErrorIcon,
  FieldShell,
  SuccessIcon,
  resolveFieldState,
  type FieldOwnProps,
} from "./Field";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    FieldOwnProps {
  size?: UIFieldSize;
  required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      hideLabel,
      error,
      helperText,
      state,
      size = "md",
      required,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const controlId = id ?? generatedId;
    const descriptionId = `${controlId}-description`;
    const resolvedState = resolveFieldState(state, error);
    const hasIcon = resolvedState !== "default";

    return (
      <FieldShell
        label={label}
        hideLabel={hideLabel}
        error={error}
        helperText={helperText}
        controlId={controlId}
        descriptionId={descriptionId}
        required={required}
        resolvedState={resolvedState}
      >
        <textarea
          ref={ref}
          id={controlId}
          required={required}
          className={cn(
            "min-h-30 w-full border-2 bg-surface-sunken text-fg placeholder:text-fg-subtle",
            "focus:outline-none focus:ring-1",
            controlMotion,
            disabledControl,
            fieldSizeRecipe[size],
            fieldStateRecipe[resolvedState],
            hasIcon && "pr-11",
            className,
      <div className="w-full">
        {/* Label with optional required asterisk */}
        <label htmlFor={props.id} className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-300">
          {label}
          {required && (
            <span className="text-rose-400" aria-hidden="true">
              *
            </span>
          )}
        </label>

        {/* Wrapper needed to position the icon over the textarea */}
        <div className="relative">
          <textarea
            ref={ref}
            required={required}
            className={`w-full rounded-lg bg-slate-900/50 border-2 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed min-h-30
              ${hasError || isSuccess ? "pr-11" : ""}
              ${borderState} ${className}`}
            aria-invalid={hasError}
            aria-describedby={
              (error || helperText) && props.id ? `${props.id}-description` : undefined
            }
            {...props}
          />

          {/* Validation state icon — top-right corner of the textarea */}
          {hasError && (
            <div className="pointer-events-none absolute top-3 right-3">
              <svg
                className="h-5 w-5 text-rose-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01"
                />
              </svg>
            </div>
          )}
          {isSuccess && (
            <div className="pointer-events-none absolute top-3 right-3">
              <svg
                className="h-5 w-5 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
          aria-invalid={resolvedState === "error"}
          aria-describedby={error || helperText ? descriptionId : undefined}
          {...props}
        />

        {hasIcon && (
          <div className="pointer-events-none absolute top-3 right-3">
            {resolvedState === "error" ? (
              <ErrorIcon className="h-5 w-5" />
            ) : (
              <SuccessIcon className="h-5 w-5" />
        {/* Error or helper text */}
        {(error || helperText) && (
          <p
            id={props.id ? `${props.id}-description` : undefined}
            role={hasError ? "alert" : undefined}
            className={`mt-1 flex items-center gap-1 text-sm ${
              hasError ? "text-rose-400" : "text-slate-400"
            }`}
          >
            {hasError && (
              <svg
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01"
                />
              </svg>
            )}
          </div>
        )}
      </FieldShell>
    );
  },
);

Textarea.displayName = "Textarea";
