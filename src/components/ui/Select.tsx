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

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    FieldOwnProps {
  options: SelectOption[];
  placeholder?: string;
  size?: UIFieldSize;
  required?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      hideLabel,
      error,
      helperText,
      state,
      options,
      placeholder,
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
        <select
          ref={ref}
          id={controlId}
          required={required}
          className={cn(
            "w-full appearance-none border-2 bg-surface-sunken text-fg",
            "focus:outline-none focus:ring-1",
            controlMotion,
            disabledControl,
            fieldSizeRecipe[size],
            fieldStateRecipe[resolvedState],
            hasIcon ? "pr-16" : "pr-10",
            className,
          )}
          aria-invalid={resolvedState === "error"}
          aria-describedby={error || helperText ? descriptionId : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
      <div className="w-full">
        {/* Label with optional required asterisk */}
        <label htmlFor={props.id} className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-300">
          {label}
          {required && (
            <span className="text-rose-400" aria-hidden="true">
              *
            </span>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-surface-raised text-fg"
            >
              {opt.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-1 px-3">
          {resolvedState === "error" && <ErrorIcon className="h-4 w-4" />}
          {resolvedState === "success" && <SuccessIcon className="h-4 w-4" />}
          <svg
            className="h-4 w-4 fill-current text-fg-subtle"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </FieldShell>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-slate-900 text-white"
              >
                {opt.label}
              </option>
            ))}
          </select>

          {/* Right side icons — validation icon + chevron */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-1 px-3">
            {hasError && (
              <svg
                className="h-4 w-4 text-rose-400"
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
            {isSuccess && (
              <svg
                className="h-4 w-4 text-emerald-400"
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
            )}
            {/* Chevron — always visible */}
            <svg
              className="h-4 w-4 fill-current text-slate-400"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Error text with icon */}
        {error && (
          <p id={`${props.id}-description`} className="mt-1 flex items-center gap-1 text-sm text-rose-400" role="alert">
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
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
