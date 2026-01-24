"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { useAuth } from "@/components/auth-provider";
import { connectFreighter, createAuthMessage, signFreighterMessage } from "@/lib/freighter";

type UiState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "signing"; address: string; message: string }
  | { status: "error"; message: string }
  | { status: "success" };

export default function SignUpPage() {
  const router = useRouter();
  const { setSession, isAddressRegistered, registerAddress } = useAuth();
  const [ui, setUi] = useState<UiState>({ status: "idle" });
  const [email, setEmail] = useState("");

  const busy = ui.status === "connecting" || ui.status === "signing";

  const primaryLabel = useMemo(() => {
    if (ui.status === "connecting") return "Connecting wallet...";
    if (ui.status === "signing") return "Waiting for signature...";
    return "Create Account";
  }, [ui.status]);

  const connect = async () => {
    try {
      setUi({ status: "connecting" });
      const address = await connectFreighter();

      if (isAddressRegistered(address)) {
        setUi({ status: "error", message: "This wallet already has an account. Please sign in." });
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

      setUi({ status: "success" });
      router.push("/");
    } catch (e) {
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
          <span className="text-sm text-white/70">Email Address (optional)</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="h-11 rounded-lg border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/30 outline-none focus:border-sky-400/60"
          />
        </label>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          <div className="font-medium text-white">What you&apos;ll approve</div>
          <div className="mt-1">
            You&apos;ll be asked to sign a message to create your account. No transaction is sent.
          </div>
          {ui.status === "signing" ? (
            <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-white/70">
              {ui.message}
            </pre>
          ) : null}
        </div>

        {ui.status === "error" ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
            {ui.message}
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

        <div className="text-center text-xs text-white/50">
          By continuing, you agree to authenticate with your wallet.
        </div>
      </div>
    </AuthShell>
  );
}
