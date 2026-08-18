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

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    FieldOwnProps {
  size?: UIFieldSize;

  /** Shows a required marker next to the label and sets `required`. */
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
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
        <div className="relative">
          <input
            ref={ref}
            id={controlId}
            required={required}
            className={cn(
              "w-full border-2 bg-surface-sunken text-fg placeholder:text-fg-subtle",
              "focus:outline-none focus:ring-1",
              controlMotion,
              disabledControl,
              fieldSizeRecipe[size],
              fieldStateRecipe[resolvedState],
              hasIcon && "pr-11",
              className,
            )}
            aria-invalid={resolvedState === "error"}
            aria-describedby={
              error || helperText ? descriptionId : undefined
            }
            {...props}
          />

          {hasIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              {resolvedState === "error" ? (
                <ErrorIcon className="h-5 w-5" />
              ) : (
                <SuccessIcon className="h-5 w-5" />
              )}
            </div>
          )}
        </div>
      </FieldShell>
    );
  },
);

Input.displayName = "Input";