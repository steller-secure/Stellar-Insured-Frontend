"use client";

import React, { useEffect, useRef, useId } from "react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  showCloseButton?: boolean;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  showCloseButton = true,
  children,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  // ── Keyboard: ESC closes, Tab traps focus inside the modal ──────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusable = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute("disabled"));

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey) {
          // Shift+Tab: wrap to last
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          // Tab: wrap to first
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // ── Move focus into the modal when it opens, restore when it closes ─────────
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      // Focus the dialog container so screen readers announce the role + label
      requestAnimationFrame(() => {
        const dialog = dialogRef.current;
        if (dialog) {
          const firstFocusable = dialog.querySelector<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
          );
          (firstFocusable ?? dialog).focus();
        }
      });
    } else {
      // Return focus to where it was before the modal opened
      previouslyFocused.current?.focus();
    }
  }, [isOpen]);

  // ── Prevent background scroll while open ────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
    >
      {/* Backdrop – click outside closes modal */}
      <button
        type="button"
        aria-label="Close modal overlay"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
        onClick={onClose}
        tabIndex={-1}
      />

      {/* Dialog panel – receives focus trap logic */}
      <div
        ref={dialogRef}
        className={`relative w-full ${sizes[size]} animate-[slideUp_0.35s_ease-out]`}
        /* Allows the div itself to receive programmatic focus when there are
           no other focusable elements available. */
        tabIndex={-1}
      >
        <div className="rounded-3xl bg-brand-card/95 border border-brand-border/70 shadow-2xl shadow-black/60">
          <div className="flex items-start justify-between gap-4 border-b border-slate-800/60 px-6 py-4">
            <div>
              {title && (
                <h2 id={titleId} className="text-lg font-semibold text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="mt-1 text-sm text-brand-text-muted">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <Button
                aria-label="Close modal"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-full border-slate-700 bg-slate-900/60 px-3 py-1 text-xs"
              >
                ✕
              </Button>
            )}
          </div>

          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
};
