/**
 * hooks/useFormValidation.ts
 *
 * Generic custom hook for real-time, field-level and form-level validation.
 * Works with any form shape. Supports sync rules and async server-side checks.
 *
 * Usage:
 *   const { errors, touched, validate, validateField, handleBlur, isValid } =
 *     useFormValidation(rules);
 */

import { useState, useCallback, useRef } from "react";
import { ValidationRule, composeValidators } from "@/lib/validators";

// ─── Types ────────────────────────────────────────────────────────────────────

/** One entry per field: an array of validation rules to run in order */
export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

/** Async validator: returns an error string or null after a server check */
export type AsyncValidator<T> = (
  field: keyof T,
  value: T[keyof T]
) => Promise<string | null>;

export interface UseFormValidationReturn<T> {
  /** Current error messages keyed by field name */
  errors: Partial<Record<keyof T, string>>;
  /** Tracks which fields the user has interacted with */
  touched: Partial<Record<keyof T, boolean>>;
  /** Fields currently running an async validation check */
  validating: Partial<Record<keyof T, boolean>>;
  /** True when all fields are valid and there are no errors */
  isValid: boolean;
  /**
   * Validates all fields at once (used on submit).
   * Returns true if the form is valid.
   */
  validate: (data: T) => boolean;
  /**
   * Validates a single field (used on change/blur).
   * Pass the current value to get an immediate result.
   */
  validateField: <K extends keyof T>(field: K, value: T[K]) => string | null;
  /**
   * Call this on an input's onBlur to mark it as touched
   * and trigger single-field validation.
   */
  handleBlur: <K extends keyof T>(field: K, value: T[K]) => void;
  /** Clears all errors and touched state */
  reset: () => void;
  /** Manually set an error on a field (e.g. from a server response) */
  setFieldError: (field: keyof T, message: string) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFormValidation<T extends Record<string, any>>(
  rules: ValidationRules<T>,
  asyncValidator?: AsyncValidator<T>
): UseFormValidationReturn<T> {

  const [errors, setErrors]         = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched]       = useState<Partial<Record<keyof T, boolean>>>({});
  const [validating, setValidating] = useState<Partial<Record<keyof T, boolean>>>({});

  // Debounce timers per field for async validation
  const debounceTimers = useRef<Partial<Record<keyof T, ReturnType<typeof setTimeout>>>>({});

  // ── Single field validation (sync) ──────────────────────────────────────────

  const validateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]): string | null => {
      const fieldRules = rules[field];
      if (!fieldRules || fieldRules.length === 0) return null;

      const error = composeValidators(value, ...(fieldRules as ValidationRule<T[K]>[]));

      setErrors((prev) => ({
        ...prev,
        [field]: error ?? undefined,
      }));

      return error;
    },
    [rules]
  );

  // ── Async field validation (debounced 400ms) ─────────────────────────────────

  const validateFieldAsync = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      if (!asyncValidator) return;

      if (debounceTimers.current[field]) {
        clearTimeout(debounceTimers.current[field]);
      }

      debounceTimers.current[field] = setTimeout(async () => {
        setValidating((prev) => ({ ...prev, [field]: true }));
        const error = await asyncValidator(field as keyof T, value as T[keyof T]);
        setValidating((prev) => ({ ...prev, [field]: false }));
        setErrors((prev) => ({ ...prev, [field]: error ?? undefined }));
      }, 400);
    },
    [asyncValidator]
  );

  // ── Blur handler ─────────────────────────────────────────────────────────────

  const handleBlur = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      // Mark field as touched so errors become visible
      setTouched((prev) => ({ ...prev, [field]: true }));
      const syncError = validateField(field, value);
      if (!syncError && asyncValidator) {
        validateFieldAsync(field, value);
      }
    },
    [validateField, validateFieldAsync, asyncValidator]
  );

  // ── Full form validation (on submit) ─────────────────────────────────────────

  const validate = useCallback(
    (data: T): boolean => {
      const newErrors: Partial<Record<keyof T, string>> = {};
      const allTouched: Partial<Record<keyof T, boolean>> = {};

      for (const field in rules) {
        const fieldRules = rules[field as keyof T];
        if (!fieldRules || fieldRules.length === 0) continue;

        allTouched[field as keyof T] = true;

        const value = data[field as keyof T];
        // Guard: only call composeValidators when there are rules to run
        if (!fieldRules || fieldRules.length === 0) continue;
        const error = composeValidators(
          value,
          ...(fieldRules as ValidationRule<typeof value>[])
        );
        if (error) newErrors[field as keyof T] = error;
      }

      setErrors(newErrors);
      setTouched((prev) => ({ ...prev, ...allTouched }));

      return Object.keys(newErrors).length === 0;
    },
    [rules]
  );

  // ── Helpers ───────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
    setValidating({});
  }, []);

  const setFieldError = useCallback((field: keyof T, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const isValid =
    Object.keys(rules).length > 0 &&
    Object.keys(errors).filter((k) => errors[k as keyof T]).length === 0;

  return {
    errors,
    touched,
    validating,
    isValid,
    validate,
    validateField,
    handleBlur,
    reset,
    setFieldError,
  };
}

// ─── Async validation hook ────────────────────────────────────────────────────

/**
 * useAsyncValidation
 *
 * Standalone hook for one-off async field checks (e.g. checking if an email
 * is already registered). Handles loading state and debouncing internally.
 */
export function useAsyncValidation(
  value: string,
  validator: (value: string) => Promise<string | null>,
  debounceMs = 400
) {
  const [error, setError]         = useState<string | null>(null);
  const [isChecking, setChecking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const run = useCallback(() => {
    if (!value) { setError(null); return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setChecking(true);
      const result = await validator(value);
      setChecking(false);
      setError(result);
    }, debounceMs);
  }, [value, validator, debounceMs]);

  return { error, isChecking, run };
}