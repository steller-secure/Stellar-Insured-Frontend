"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { useAuth } from "@/components/auth-provider-enhanced";
import { useToast } from "@/components/ui/toast";
import {
  connectFreighter,
  createAuthMessage,
  signFreighterMessage,
} from "@/lib/freighter";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useFormValidation } from "@/hooks/useFormValidation";
import { required, email, minLength, pattern } from "@/lib/validators";

// ─── Types ────────────────────────────────────────────────────────────────────

type UiState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "signing"; address: string; message: string }
  | { status: "error"; message: string }
  | { status: "success" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface SignUpFormData extends Record<string, any> {
  email: string;
  password: string;
  confirmPassword: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SignUpPage() {
  const router = useRouter();
  const { setSession, isAddressRegistered, registerAddress } = useAuth();
  const { showToast } = useToast();
  const { trackAction, trackError } = useAnalytics();

  const [ui, setUi] = useState<UiState>({ status: "idle" });

  const [formData, setFormData] = useState<SignUpFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const busy = ui.status === "connecting" || ui.status === "signing";

  // ── Validation rules ──────────────────────────────────────────────────────

  const { errors, touched, validate, validateField, handleBlur } =
    useFormValidation<SignUpFormData>({
      email: [
        required("Email address is required"),
        email("Please enter a valid email address"),
      ],
      password: [
        required("Password is required"),
        minLength(8, "Password must be at least 8 characters"),
        // Must contain at least one number
        pattern(/\d/, "Password must contain at least one number"),
        // Must contain at least one uppercase letter
        pattern(/[A-Z]/, "Password must contain at least one uppercase letter"),
      ],
      confirmPassword: [
        required("Please confirm your password"),
        // Confirm password must match password — checked inline
        (value) =>
          value !== formData.password ? "Passwords do not match" : null,
      ],
    });

  // ── Handlers ─────────────────────────────────────────────────────────────

  /**
   * Updates a field and re-validates in real-time if it has already been touched.
   * Also re-validates confirmPassword when password changes since it's dependent.
   */
  const handleChange = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
    // Re-validate confirmPassword whenever password changes
    if (field === "password" && touched.confirmPassword) {
      validateField("confirmPassword", formData.confirmPassword);
    }
  };

  const primaryLabel = useMemo(() => {
    if (ui.status === "connecting") return "Connecting...";
    if (ui.status === "signing") return "Confirm in wallet...";
    return "Sign up";
  }, [ui.status]);

  /**
   * Runs full form validation before attempting wallet connection.
   * Replaces the previous manual password match check with the hook.
   */
  const connect = async () => {
    // Validate all fields — shows all errors at once if any fail
    if (!validate(formData)) return;

    try {
      setUi({ status: "connecting" });
      const address = await connectFreighter();

      if (isAddressRegistered(address)) {
        showToast(
          "This wallet already has an account. Please sign in.",
          "error",
        );
        trackAction("AUTH", "SIGNUP_ERROR", {
          reason: "Wallet already registered",
        });
        setUi({ status: "idle" });
        return;
      }

      const { message } = createAuthMessage(address);
      setUi({ status: "signing", address, message });
      const signed = await signFreighterMessage(address, message);

      registerAddress(address, {
        createdAt: Date.now(),
        email: formData.email.trim() || undefined,
      });

      setSession({
        address,
        signedMessage: signed.signedMessage,
        signerAddress: signed.signerAddress,
        authenticatedAt: Date.now(),
      });

      trackAction("AUTH", "SIGNUP_SUCCESS", {
        hasEmail: !!formData.email.trim(),
      });
      setUi({ status: "success" });
      showToast("Account created successfully!", "success");
      router.push("/");
    } catch (e) {
      trackError(e as Error, { context: "signup" });
      setUi({
        status: "error",
        message: e instanceof Error ? e.message : "Something went wrong",
      });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AuthShell
      title="Join Stellar Insured"
      subtitle="Create your account and start protecting your digital assets today"
      footer={
        <div>
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-medium text-sky-400 hover:text-sky-300"
          >
            Sign in
          </Link>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* ── Email field ── */}
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 text-sm text-white/70">
            Email Address
            {/* Required asterisk */}
            <span className="text-rose-400" aria-hidden="true">
              *
            </span>
          </label>
          <div className="relative">
            <input
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email", formData.email)}
              placeholder="your@email.com"
              type="email"
              // Supports autofill/paste — onChange fires for both
              autoComplete="email"
              aria-invalid={touched.email && !!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`h-11 w-full rounded-lg border bg-white/5 px-4 text-white placeholder:text-white/30 outline-none transition-colors
                ${
                  touched.email && errors.email
                    ? "border-rose-500 focus:border-rose-500"
                    : touched.email && !errors.email
                      ? "border-emerald-500/80 focus:border-emerald-500"
                      : "border-white/10 focus:border-sky-400/60"
                }`}
            />
            {/* Validation icon */}
            {touched.email && errors.email && (
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
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
              </div>
            )}
            {touched.email && !errors.email && formData.email && (
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
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
              </div>
            )}
          </div>
          {/* Inline error message */}
          {touched.email && errors.email && (
            <p
              id="email-error"
              className="flex items-center gap-1 text-xs text-rose-400"
              role="alert"
            >
              <svg
                className="h-3 w-3 shrink-0"
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
              {errors.email}
            </p>
          )}
        </div>

        {/* ── Password field ── */}
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 text-sm text-white/70">
            Password
            <span className="text-rose-400" aria-hidden="true">
              *
            </span>
          </label>
          <div className="relative">
            <input
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password", formData.password)}
              placeholder="Enter your password"
              type="password"
              autoComplete="new-password"
              aria-invalid={touched.password && !!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`h-11 w-full rounded-lg border bg-white/5 px-4 text-white placeholder:text-white/30 outline-none transition-colors
                ${
                  touched.password && errors.password
                    ? "border-rose-500 focus:border-rose-500"
                    : touched.password && !errors.password
                      ? "border-emerald-500/80 focus:border-emerald-500"
                      : "border-white/10 focus:border-sky-400/60"
                }`}
            />
            {touched.password && errors.password && (
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
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
              </div>
            )}
            {touched.password && !errors.password && formData.password && (
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
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
              </div>
            )}
          </div>
          {touched.password && errors.password && (
            <p
              id="password-error"
              className="flex items-center gap-1 text-xs text-rose-400"
              role="alert"
            >
              <svg
                className="h-3 w-3 shrink-0"
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
              {errors.password}
            </p>
          )}
        </div>

        {/* ── Confirm Password field ── */}
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 text-sm text-white/70">
            Confirm Password
            <span className="text-rose-400" aria-hidden="true">
              *
            </span>
          </label>
          <div className="relative">
            <input
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              onBlur={() =>
                handleBlur("confirmPassword", formData.confirmPassword)
              }
              placeholder="Confirm your password"
              type="password"
              autoComplete="new-password"
              aria-invalid={touched.confirmPassword && !!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword ? "confirm-password-error" : undefined
              }
              className={`h-11 w-full rounded-lg border bg-white/5 px-4 text-white placeholder:text-white/30 outline-none transition-colors
                ${
                  touched.confirmPassword && errors.confirmPassword
                    ? "border-rose-500 focus:border-rose-500"
                    : touched.confirmPassword && !errors.confirmPassword
                      ? "border-emerald-500/80 focus:border-emerald-500"
                      : "border-white/10 focus:border-sky-400/60"
                }`}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
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
              </div>
            )}
            {touched.confirmPassword &&
              !errors.confirmPassword &&
              formData.confirmPassword && (
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
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
                </div>
              )}
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <p
              id="confirm-password-error"
              className="flex items-center gap-1 text-xs text-rose-400"
              role="alert"
            >
              <svg
                className="h-3 w-3 shrink-0"
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
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* ── Wallet signing message ── */}
        {ui.status === "signing" ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <div className="font-medium text-white">Signature Required</div>
            <div className="mt-1">
              Approve the message signature in your wallet to complete sign up.
              No transaction is sent.
            </div>
            <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-white/70">
              {ui.message}
            </pre>
          </div>
        ) : null}

        {/* ── API / wallet error ── */}
        {ui.status === "error" && (
          <p
            className="flex items-center gap-1 text-xs text-rose-400"
            role="alert"
          >
            <svg
              className="h-3 w-3 shrink-0"
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
            {ui.message}
          </p>
        )}

        {/* ── Submit button ── */}
        <button
          type="button"
          onClick={connect}
          disabled={busy}
          className="h-11 w-full rounded-lg bg-sky-500 font-semibold text-zinc-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {primaryLabel}
        </button>
      </div>
    </AuthShell>
  );
}
