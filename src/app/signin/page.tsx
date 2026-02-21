"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect, Suspense } from "react";
import { AuthShell } from "@/components/auth-shell";
import { useAuth } from "@/components/auth-provider-enhanced";
import { useToast } from "@/components/ui/toast";
import {
  connectFreighter,
  createAuthMessage,
  signFreighterMessage,
} from "@/lib/freighter";
import { useFormValidation } from "@/hooks/useFormValidation";
import { required, email } from "@/lib/validators";

// ─── Types ────────────────────────────────────────────────────────────────────

type UiState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "signing"; address: string; message: string }
  | { status: "error"; message: string }
  | { status: "success" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface SignInFormData extends Record<string, any> {
  email: string;
  password: string;
}

// ─── Inner component (needs useSearchParams so must be wrapped in Suspense) ───

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession, isAddressRegistered } = useAuth();
  const { showToast } = useToast();

  const [ui, setUi] = useState<UiState>({ status: "idle" });
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
  });

  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const urlMessage = searchParams.get("message");

  useEffect(() => {
    if (urlMessage) showToast(urlMessage, "info");
  }, [urlMessage, showToast]);

  const busy = ui.status === "connecting" || ui.status === "signing";

  // ── Validation rules ────────────────────────────────────────────────────────

  const { errors, touched, validate, validateField, handleBlur } =
    useFormValidation<SignInFormData>({
      email: [
        required("Email address is required"),
        email("Please enter a valid email address"),
      ],
      password: [required("Password is required")],
    });

  // ── Handlers ─────────────────────────────────────────────────────────────

  /**
   * Updates a field and re-validates in real-time if already touched.
   * onChange fires for both typing and autofill/paste so validation
   * always reflects the current value.
   */
  const handleChange = (field: keyof SignInFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const primaryLabel = useMemo(() => {
    if (ui.status === "connecting") return "Connecting...";
    if (ui.status === "signing") return "Confirm in wallet...";
    return "Sign In";
  }, [ui.status]);

  /**
   * Validates all fields before attempting wallet connection.
   * If validation fails, all errors are shown at once.
   */
  const connect = async () => {
    if (!validate(formData)) return;

    try {
      setUi({ status: "connecting" });
      const address = await connectFreighter();

      if (!isAddressRegistered(address)) {
        showToast(
          "No account found for this wallet. Please sign up first.",
          "error",
        );
        setUi({ status: "idle" });
        return;
      }

      const { message } = createAuthMessage(address);
      setUi({ status: "signing", address, message });
      const signed = await signFreighterMessage(address, message);

      setSession({
        address,
        signedMessage: signed.signedMessage,
        signerAddress: signed.signerAddress,
        authenticatedAt: Date.now(),
      });

      setUi({ status: "success" });
      showToast("Successfully signed in!", "success");
      router.push(callbackUrl);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Something went wrong";
      showToast(errorMsg, "error");
      setUi({ status: "idle" });
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to secure your digital assets"
      footer={
        <div>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-sky-400 hover:text-sky-300"
          >
            Sign up
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
              placeholder="Enter your email"
              type="email"
              // autoComplete enables browser autofill — onChange handles validation for both typing and autofill
              autoComplete={rememberMe ? "email" : "off"}
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
            {/* Error icon */}
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
            {/* Success icon */}
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
              autoComplete={rememberMe ? "current-password" : "off"}
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

        {/* ── Remember me + forgot password ── */}
        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 rounded border border-white/20 bg-white/10"
            />
            Remember me
          </label>
          <a
            href="#"
            className="text-sm font-medium text-sky-400 hover:text-sky-300"
          >
            Forgotten password?
          </a>
        </div>

        {/* ── Wallet signing message ── */}
        {ui.status === "signing" ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <div className="font-medium text-white">Signature Required</div>
            <div className="mt-1">
              Approve the message signature in your wallet to complete sign in.
              No transaction is sent.
            </div>
            <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-white/70">
              {ui.message}
            </pre>
          </div>
        ) : null}

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

// ─── Page (Suspense required for useSearchParams) ─────────────────────────────

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
