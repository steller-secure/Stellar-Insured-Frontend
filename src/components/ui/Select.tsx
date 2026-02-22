import React, { forwardRef } from "react";

type SelectState = "default" | "success" | "error";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  state?: SelectState;
  /** Shows a red asterisk next to the label */
  required?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      placeholder,
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

        <div className="relative">
          <select
            ref={ref}
            required={required}
            className={`w-full appearance-none rounded-lg bg-slate-900/50 border-2 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed
              ${hasError || isSuccess ? "pr-16" : "pr-10"}
              ${borderState} ${className}`}
            aria-invalid={hasError}
            {...props}
          >
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
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Error text with icon */}
        {error && (
          <p className="mt-1 flex items-center gap-1 text-sm text-rose-400">
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
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
