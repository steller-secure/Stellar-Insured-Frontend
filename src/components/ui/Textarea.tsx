import React, { forwardRef } from "react";

type TextareaState = "default" | "success" | "error";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  state?: TextareaState;
  /** Shows a red asterisk next to the label */
  required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
        : "border-slate-800 hover:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500";

    return (
      <div className="w-full">
        {/* Label with optional required asterisk */}
        <label className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-300">
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

Textarea.displayName = "Textarea";
