"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth-shell";
import { useAuth } from "@/components/auth-provider";
import {
  connectFreighter,
  createAuthMessage,
  signFreighterMessage,
} from "@/lib/freighter";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import {
  signupSchema,
  type SignupFormValues,
} from "@/lib/form-schemas";
import { FormInput } from "@/components/ui/rhf/FormInput";
import { FormSummaryError } from "@/components/ui/rhf/FormSummaryError";

// ─── Types ────────────────────────────────────────────────────────────────────

type UiState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "signing"; address: string; message: string }
  | { status: "success" };

// ─── Component ────────────────────────────────────────────────────────────────

export default function SignUpPage() {
  const router = useRouter();
  const { setSession, isAddressRegistered, registerAddress } = useAuth();
  const { trackAction } = useAnalytics();
  const { handleError, showSuccessNotification, showErrorNotification } = useErrorHandler();

  const [ui, setUi] = useState<UiState>({ status: "idle" });

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isValid },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const busy = ui.status === "connecting" || ui.status === "signing";
  const submitDisabled = busy || !isDirty || !isValid;

  const primaryLabel = useMemo(() => {
    if (ui.status === "connecting") return "Connecting...";
    if (ui.status === "signing") return "Confirm in wallet...";
    return "Sign up";
  }, [ui.status]);

  const rootError = (errors.root as { message?: string } | undefined)?.message;

  /**
   * Runs full form validation before attempting wallet connection.
   * Non-field failures (wallet/signing) surface as a summary error.
   */
  const onSubmit = handleSubmit(async (data) => {
    try {
      setUi({ status: "connecting" });
      const address = await connectFreighter();

      if (isAddressRegistered(address)) {
        const appError = handleError(
          "AUTHENTICATION",
          "UNAUTHORIZED",
          new Error("This wallet already has an account. Please sign in."),
          { action: "signup", reason: "wallet_already_registered" }
        );
        setError("root", {
          message: "This wallet already has an account. Please sign in.",
        });
        showErrorNotification(appError);
        setUi({ status: "idle" });
        return;
      }

      const { message } = createAuthMessage(address);
      setUi({ status: "signing", address, message });
      const signed = await signFreighterMessage(address, message);

      registerAddress(address, {
        createdAt: Date.now(),
        email: data.email.trim() || undefined,
      });

      setSession({
        address,
        signedMessage: signed.signedMessage,
        signerAddress: signed.signerAddress,
        authenticatedAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });

      trackAction("AUTH", "SIGNUP_SUCCESS", {
        hasEmail: !!data.email.trim(),
      });
      showSuccessNotification("Signed up successfully!");
      setUi({ status: "success" });
      router.push("/");
    } catch (e) {
      const appError = handleError(
        "WALLET",
        "GENERIC_ERROR",
        e,
        { context: "signup" }
      );

      setError("root", {
        message: e instanceof Error ? e.message : appError.message,
      });
      showErrorNotification(appError);
      setUi({ status: "idle" });
    }
  });

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
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormSummaryError
          message={rootError}
          id="signup-summary-error"
        />

        <FormInput
          name="email"
          control={control}
          label="Email Address"
          required
          placeholder="your@email.com"
          type="email"
          autoComplete="email"
        />

        <FormInput
          name="password"
          control={control}
          label="Password"
          required
          placeholder="Enter your password"
          type="password"
          autoComplete="new-password"
        />

        <FormInput
          name="confirmPassword"
          control={control}
          label="Confirm Password"
          required
          placeholder="Confirm your password"
          type="password"
          autoComplete="new-password"
        />

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