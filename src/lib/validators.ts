/**
 * lib/validators.ts
 *
 * Reusable, pure validation functions used by useFormValidation hook
 * and directly in components where needed.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ValidationRule<T = string> = (value: T) => string | null;

// ─── String validators ────────────────────────────────────────────────────────

/** Fails if the value is empty or whitespace only */
export const required =
  (message = "This field is required"): ValidationRule =>
  (value) =>
    !value || !value.trim() ? message : null;

/** Fails if string length is below the minimum */
export const minLength =
  (min: number, message?: string): ValidationRule =>
  (value) =>
    value && value.trim().length < min
      ? message ?? `Must be at least ${min} characters`
      : null;

/** Fails if string length exceeds the maximum */
export const maxLength =
  (max: number, message?: string): ValidationRule =>
  (value) =>
    value && value.trim().length > max
      ? message ?? `Must be no more than ${max} characters`
      : null;

/** Fails if the value does not match the given regex pattern */
export const pattern =
  (regex: RegExp, message: string): ValidationRule =>
  (value) =>
    value && !regex.test(value) ? message : null;

/** Validates a standard email format */
export const email =
  (message = "Please enter a valid email address"): ValidationRule =>
  (value) =>
    value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? message : null;

// ─── Number validators ────────────────────────────────────────────────────────

/** Fails if the numeric value is less than min */
export const min =
  (minVal: number, message?: string): ValidationRule =>
  (value) =>
    value && Number(value) < minVal
      ? message ?? `Must be at least ${minVal}`
      : null;

/** Fails if the numeric value exceeds max */
export const max =
  (maxVal: number, message?: string): ValidationRule =>
  (value) =>
    value && Number(value) > maxVal
      ? message ?? `Must be no more than ${maxVal}`
      : null;

/** Fails if the value is not a valid number */
export const numeric =
  (message = "Must be a valid number"): ValidationRule =>
  (value) =>
    value && isNaN(Number(value)) ? message : null;

/** Fails if the value is not a positive number */
export const positiveNumber =
  (message = "Must be greater than 0"): ValidationRule =>
  (value) =>
    value && Number(value) <= 0 ? message : null;

// ─── File validators ──────────────────────────────────────────────────────────

/** Fails if no file is provided */
export const requiredFile =
  (message = "Please upload a file"): ValidationRule<File | null> =>
  (value) =>
    !value ? message : null;

/** Fails if the file size exceeds the max (in bytes) */
export const maxFileSize =
  (maxBytes: number, message?: string): ValidationRule<File | null> =>
  (value) =>
    value && value.size > maxBytes
      ? message ?? `File size must be under ${Math.round(maxBytes / 1024 / 1024)}MB`
      : null;

/** Fails if the file type is not in the allowed list */
export const allowedFileTypes =
  (types: string[], message?: string): ValidationRule<File | null> =>
  (value) =>
    value && !types.includes(value.type)
      ? message ?? `Allowed file types: ${types.join(", ")}`
      : null;

// ─── Compose ──────────────────────────────────────────────────────────────────

/**
 * Runs multiple validation rules in order and returns the first error found.
 * Returns null if all rules pass.
 */
export function composeValidators<T>(
  value: T,
  ...rules: ValidationRule<T>[]
): string | null {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
}