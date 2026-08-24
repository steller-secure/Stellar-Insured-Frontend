"use client";

import React from "react";

interface FormSummaryErrorProps {
  /** Error message to display (typically a root-level form error) */
  message?: string;
  /** Optional id for the alert region */
  id?: string;
  className?: string;
}

export function FormSummaryError({
  message,
  id,
  className = "",
}: FormSummaryErrorProps) {
  if (!message) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      className={`rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-400 ${className}`}
    >
      <div className="flex items-start gap-2">
        <svg
          className="mt-0.5 h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
}