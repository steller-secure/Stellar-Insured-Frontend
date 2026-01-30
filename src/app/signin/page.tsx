"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { AuthShell } from "@/components/auth-shell";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/ui/toast";
import { connectFreighter, createAuthMessage, signFreighterMessage } from "@/lib/freighter";

type UiState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "signing"; address: string; message: string }
  | { status: "error"; message: string }
  | { status: "success" };

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession, isAddressRegistered } = useAuth();
  const { showToast } = useToast();
  const [ui, setUi] = useState<UiState>({ status: "idle" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const message = searchParams.get("message");

  useEffect(() => {
    if (message) {
      showToast(message, "info");
    }
  }, [message, showToast]);

  const busy = ui.status === "connecting" || ui.status === "signing";

  const primaryLabel = useMemo(() => {
    if (ui.status === "connecting") return "Connecting...";
    if (ui.status === "signing") return "Confirm in wallet...";
    return "Sign In";
  }, [ui.status]);

  const connect = async () => {
    try {
      setUi({ status: "connecting" });
      const address = await connectFreighter();

      if (!isAddressRegistered(address)) {
        showToast("No account found for this wallet. Please sign up first.", "error");
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

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to secure your digital assets"
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
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Email Address</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete={rememberMe ? "email" : "off"}
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
            autoComplete={rememberMe ? "current-password" : "off"}
            className="h-11 rounded-lg border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/30 outline-none focus:border-sky-400/60"
          />
        </label>

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

          <a href="#" className="text-sm font-medium text-sky-400 hover:text-sky-300">
            Forgotten password?
          </a>
        </div>

        {ui.status === "signing" ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <div className="font-medium text-white">Signature Required</div>
            <div className="mt-1">
              Approve the message signature in your wallet to complete sign in. No transaction is sent.
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
