import React, { forwardRef } from "react";

type InputState = "default" | "success" | "error";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  state?: InputState;
  /** Shows a red asterisk next to the label */
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      state = "default",
      required,
      className = "",
      ...props
    },
    ref,
  ) => {
    const hasError = state === "error" || !!error;
    const isSuccess = state === "success" && !hasError;

    const borderState = hasError
      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
      : isSuccess
        ? "border-emerald-500/80 focus:border-emerald-500 focus:ring-emerald-500"
        : "border-slate-800 dark:border-slate-600 hover:border-slate-700 dark:hover:border-slate-500 focus:border-brand-primary focus:ring-brand-primary";

    return (
      <div className="w-full">
        {/* Label with optional required asterisk */}
        <label className="mb-2 flex items-center gap-1 text-sm font-medium text-text-secondary dark:text-slate-300">
          {label}
          {required && (
            <span className="text-rose-400" aria-hidden="true">
              *
            </span>
          )}
        </label>

        <div className="relative">
          <input
            ref={ref}
            required={required}
            className={`w-full rounded-lg bg-slate-900/50 dark:bg-slate-800/50 border-2 px-4 py-3 text-text-primary dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-colors focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed
              ${hasError || isSuccess ? "pr-11" : ""}
              ${borderState} ${className}`}
            aria-invalid={hasError}
            aria-describedby={
              hasError || helperText ? `${props.id}-description` : undefined
            }
            {...props}
          />

          {/* Validation state icon — shown inside the input on the right */}
          {hasError && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-5 w-5 text-rose-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
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
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-5 w-5 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Error or helper text */}
        {(error || helperText) && (
          <p
            id={`${props.id}-description`}
            className={`mt-1 flex items-center gap-1 text-sm ${
              hasError ? "text-rose-400" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {hasError && (
              <svg
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
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

Input.displayName = "Input";
