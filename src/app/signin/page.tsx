"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth-shell";
import { useAuth } from "@/components/auth-provider";
import {
  connectFreighter,
  createAuthMessage,
  signFreighterMessage,
} from "@/lib/freighter";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import {
  signinSchema,
  type SigninFormValues,
} from "@/lib/form-schemas";
import { FormInput } from "@/components/ui/rhf/FormInput";
import { FormSummaryError } from "@/components/ui/rhf/FormSummaryError";

// ─── Types ────────────────────────────────────────────────────────────────────

type UiState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "signing"; address: string; message: string }
  | { status: "success" };

// ─── Inner component (needs useSearchParams so must be wrapped in Suspense) ───

function SignInContent() {
  const router = useRouter();
  const { handleError, showSuccessNotification, showErrorNotification } = useErrorHandler();
  const searchParams = useSearchParams();
  const { setSession, isAddressRegistered } = useAuth();

  const [ui, setUi] = useState<UiState>({ status: "idle" });
  const [rememberMe, setRememberMe] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const urlMessage = searchParams.get("message");

  useEffect(() => {
    if (urlMessage) {
      // TODO: Consider alternative notification mechanism
      console.info(urlMessage);
    }
  }, [urlMessage]);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isValid },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const busy = ui.status === "connecting" || ui.status === "signing";
  const submitDisabled = busy || !isDirty || !isValid;

  const primaryLabel = useMemo(() => {
    if (ui.status === "connecting") return "Connecting...";
    if (ui.status === "signing") return "Confirm in wallet...";
    return "Sign In";
  }, [ui.status]);

  const rootError = (errors.root as { message?: string } | undefined)?.message;

  /**
   * Validates all fields before attempting wallet connection.
   * Non-field failures (wallet/signing) surface as a summary error.
   */
  const onSubmit = handleSubmit(async () => {
    try {
      setUi({ status: "connecting" });
      const address = await connectFreighter();

      if (!isAddressRegistered(address)) {
        const appError = handleError(
          "AUTHENTICATION",
          "UNAUTHORIZED",
          new Error("No account found for this wallet. Please sign up first."),
          { action: "signin", reason: "address_not_registered" }
        );
        setError("root", {
          message: "No account found for this wallet. Please sign up first.",
        });
        showErrorNotification(appError);
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
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });

      showSuccessNotification("Signed in successfully!");

      setUi({ status: "success" });
      router.push(callbackUrl);
    } catch (e) {
      const appError = handleError(
        "WALLET",
        "GENERIC_ERROR",
        e,
        { context: "signin" }
      );

      setError("root", {
        message: e instanceof Error ? e.message : appError.message,
      });
      setUi({ status: "idle" });
      showErrorNotification(appError);
    }
  });

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
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormSummaryError
          message={rootError}
          id="signin-summary-error"
        />

        <FormInput
          name="email"
          control={control}
          label="Email Address"
          required
          placeholder="Enter your email"
          type="email"
          autoComplete={rememberMe ? "email" : "off"}
        />

        <FormInput
          name="password"
          control={control}
          label="Password"
          required
          placeholder="Enter your password"
          type="password"
          autoComplete={rememberMe ? "current-password" : "off"}
        />

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
          type="submit"
          disabled={submitDisabled}
          className="h-11 w-full rounded-lg bg-sky-500 font-semibold text-zinc-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {primaryLabel}
        </button>
      </form>
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