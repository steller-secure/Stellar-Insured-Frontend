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
            )}
          </div>
        )}
      </FieldShell>
    );
  },
);

Textarea.displayName = "Textarea";
