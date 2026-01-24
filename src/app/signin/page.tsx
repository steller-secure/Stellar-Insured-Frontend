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

export default function SignInPage() {
  const router = useRouter();
  const { setSession, isAddressRegistered } = useAuth();
  const [ui, setUi] = useState<UiState>({ status: "idle" });

  const busy = ui.status === "connecting" || ui.status === "signing";

  const primaryLabel = useMemo(() => {
    if (ui.status === "connecting") return "Connecting wallet...";
    if (ui.status === "signing") return "Waiting for signature...";
    return "Connect Wallet";
  }, [ui.status]);

  const connect = async () => {
    try {
      setUi({ status: "connecting" });
      const address = await connectFreighter();

      if (!isAddressRegistered(address)) {
        setUi({
          status: "error",
          message: "No account found for this wallet. Please sign up first.",
        });
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
      router.push("/");
    } catch (e) {
      setUi({ status: "error", message: e instanceof Error ? e.message : "Something went wrong" });
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to secure your digital assets using your Stellar wallet"
      footer={
        <div>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-sky-400 hover:text-sky-300">
            Sign up
          </Link>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          <div className="font-medium text-white">What you&apos;ll approve</div>
          <div className="mt-1">
            You&apos;ll be asked to sign a message to prove you control your wallet. No transaction is sent.
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
