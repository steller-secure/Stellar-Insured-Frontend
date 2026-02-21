"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { useAuth } from "@/components/auth-provider-enhanced";
import { useToast } from "@/components/ui/toast";
import { connectFreighter, createAuthMessage, signFreighterMessage } from "@/lib/freighter";

import { useAnalytics } from "@/hooks/useAnalytics";

type UiState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "signing"; address: string; message: string }
  | { status: "error"; message: string }
  | { status: "success" };

export default function SignUpPage() {
  const router = useRouter();
  const { setSession, isAddressRegistered, registerAddress } = useAuth();
  const { showToast } = useToast();
  const { trackAction, trackError } = useAnalytics();
  const [ui, setUi] = useState<UiState>({ status: "idle" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const busy = ui.status === "connecting" || ui.status === "signing";

  const primaryLabel = useMemo(() => {
    if (ui.status === "connecting") return "Connecting...";
    if (ui.status === "signing") return "Confirm in wallet...";
    return "Sign up";
  }, [ui.status]);

  const connect = async () => {
    try {
      if (password !== confirmPassword) {
        showToast("Passwords do not match", "error");
        trackAction("AUTH", "SIGNUP_ERROR", { reason: "Passwords do not match" });
        return;
      }

      setUi({ status: "connecting" });
      const address = await connectFreighter();

      if (isAddressRegistered(address)) {
        showToast("This wallet already has an account. Please sign in.", "error");
        trackAction("AUTH", "SIGNUP_ERROR", { reason: "Wallet already registered" });
        return;
      }

      const { message } = createAuthMessage(address);
      setUi({ status: "signing", address, message });
      const signed = await signFreighterMessage(address, message);

      registerAddress(address, { createdAt: Date.now(), email: email.trim() || undefined });
      setSession({
        address,
        signedMessage: signed.signedMessage,
        signerAddress: signed.signerAddress,
        authenticatedAt: Date.now(),
      });

      trackAction("AUTH", "SIGNUP_SUCCESS", { hasEmail: !!email.trim() });
      setUi({ status: "success" });
      showToast("Account created successfully!", "success");
      router.push("/");
    } catch (e) {
      trackError(e as Error, { context: "signup" });
      setUi({ status: "error", message: e instanceof Error ? e.message : "Something went wrong" });
    }
  };

  return (
    <AuthShell
      title="Join Stellar Insured"
      subtitle="Create your account and start protecting your digital assets today"
      footer={
        <div>
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-sky-400 hover:text-sky-300">
            Sign in
          </Link>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Email Address</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your@email.com"
            className="h-11 rounded-lg border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/30 outline-none focus:border-sky-400/60"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your Password"
            type="password"
            className="h-11 rounded-lg border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/30 outline-none focus:border-sky-400/60"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Confirm Password</span>
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your Password"
            type="password"
            className="h-11 rounded-lg border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/30 outline-none focus:border-sky-400/60"
          />
        </label>

        {ui.status === "signing" ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <div className="font-medium text-white">Signature Required</div>
            <div className="mt-1">
              Approve the message signature in your wallet to complete sign up. No transaction is sent.
            </div>
            <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-white/70">
              {ui.message}
            </pre>
          </div>
        ) : null}

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
