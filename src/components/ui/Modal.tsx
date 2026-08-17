"use client";

import React, { useEffect, useId } from "react";
import { cn } from "@/design-system";
import { Button } from "./Button";

export type ModalSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  showCloseButton?: boolean;
  /** Footer actions, rendered in a bordered row below the body. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const sizes: Record<ModalSize, string> = {
  xs: "max-w-sm",
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  showCloseButton = true,
  footer,
  children,
}) => {
  const headingId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? headingId : undefined}
      aria-describedby={description ? descriptionId : undefined}
    >
      <button
        type="button"
        aria-label="Close modal overlay"
        className="absolute inset-0 bg-scrim backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={cn(
          "relative w-full animate-slide-up motion-reduce:animate-none",
          sizes[size],
        )}
      >
        <div className="rounded-surface border border-border bg-surface-overlay shadow-elevation-4">
          <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-6 py-4">
            <div>
              {title && (
                <h2 id={headingId} className="text-lg font-semibold text-fg">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-fg-muted">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <Button
                aria-label="Close modal"
                variant="ghost"
                color="neutral"
                size="sm"
                iconOnly
                onClick={onClose}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6l12 12M18 6L6 18"
                  />
                </svg>
              </Button>
            )}
          </div>

          <div className="px-6 py-5 text-fg">{children}</div>

          {footer && (
            <div className="flex items-center justify-end gap-3 border-t border-border-subtle px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
