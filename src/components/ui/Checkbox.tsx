import React, { forwardRef } from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  /** Shows a red asterisk next to the label */
  required?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        <label
          htmlFor={id}
          className="flex cursor-pointer items-start gap-2.5"
        >
          <input
            ref={ref}
            id={id}
            type="checkbox"
            required={required}
            className={`mt-0.5 h-4 w-4 shrink-0 rounded border-2 bg-slate-900/50 dark:bg-slate-800/50 transition-colors focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed
              ${
                hasError
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                  : "border-slate-700 dark:border-slate-600 focus:border-brand-primary focus:ring-brand-primary"
              }
              ${className}`}
            aria-invalid={hasError}
            aria-describedby={
              error || helperText ? `${id}-description` : undefined
            }
            {...props}
          />
          <span className="text-sm font-medium text-text-secondary dark:text-slate-300">
            {label}
            {required && (
              <span className="text-rose-400" aria-hidden="true">
                {" "}
                *
              </span>
            )}
          </span>
        </label>

        {(error || helperText) && (
          <p
            id={`${id}-description`}
            className={`mt-1 flex items-center gap-1 text-sm ${
              hasError ? "text-rose-400" : "text-slate-400 dark:text-slate-500"
            }`}
            role={hasError ? "alert" : undefined}
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
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";