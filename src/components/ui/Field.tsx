import React from "react";
import { cn } from "@/design-system";
import type { UIFieldState } from "@/design-system";

/**
 * The chrome every form field shares: label, required marker, validation
 * icon and the error/helper line underneath.
 *
 * Input, Select and Textarea all render through this so their labels, spacing
 * and `aria-describedby` wiring cannot drift apart.
 */

export interface FieldOwnProps {
  label: string;
  /** Hides the label visually while keeping it available to screen readers. */
  hideLabel?: boolean;
  error?: string;
  helperText?: string;
  state?: UIFieldState;
}

export function resolveFieldState(
  state: UIFieldState | undefined,
  error: string | undefined,
): UIFieldState {
  if (state === "error" || error) return "error";
  if (state === "success") return "success";
  return "default";
}

export function ErrorIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={cn("text-error", className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
    </svg>
  );
}

export function SuccessIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={cn("text-success", className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

interface FieldShellProps extends FieldOwnProps {
  controlId: string;
  descriptionId: string;
  required?: boolean;
  resolvedState: UIFieldState;
  children: React.ReactNode;
}

export function FieldShell({
  label,
  hideLabel = false,
  error,
  helperText,
  controlId,
  descriptionId,
  required,
  resolvedState,
  children,
}: FieldShellProps) {
  const message = error || helperText;

  return (
    <div className="w-full">
      <label
        htmlFor={controlId}
        className={cn(
          "mb-2 flex items-center gap-1 text-sm font-medium text-fg-muted",
          hideLabel && "sr-only",
        )}
      >
        {label}
        {required && (
          <span className="text-error" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div className="relative">{children}</div>

      {message && (
        <p
          id={descriptionId}
          role={error ? "alert" : undefined}
          className={cn(
            "mt-1.5 flex items-center gap-1 text-sm",
            resolvedState === "error" ? "text-error" : "text-fg-subtle",
          )}
        >
          {resolvedState === "error" && (
            <ErrorIcon className="h-3.5 w-3.5 shrink-0" />
          )}
          {message}
        </p>
      )}
    </div>
  );
}
