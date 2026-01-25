"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import HeroSection from "@/components/HeroSection";
import { HowItWorksSection } from '@/components/HowItWorksSection';
import NavBar from "@/components/NavBar";

export default function Home() {
  const router = useRouter();
  const { session, signOut } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
      <NavBar />
      <main className="flex flex-col items-center justify-center gap-8 p-8 text-center">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          Stellar Insured
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Decentralized insurance platform built on Stellar
        </p>

        {session ? (
          <div className="flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
            <div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Signed in as</div>
              <div className="mt-1 break-all font-mono text-sm text-zinc-900 dark:text-zinc-100">
                {session.address}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  signOut();
                  router.push("/signin");
                }}
                className="rounded-lg bg-sky-500 px-5 py-2.5 font-semibold text-zinc-950 hover:bg-sky-400"
              >
                Sign Out
              </button>
              <button
                type="button"
                onClick={() => router.push("/signin")}
                className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 font-semibold text-zinc-100 hover:bg-white/10"
              >
                Switch Account
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <a
              href="/signin"
              className="rounded-lg bg-sky-500 px-5 py-2.5 font-semibold text-zinc-950 hover:bg-sky-400"
            >
              Sign In
            </a>
            <a
              href="/signup"
              className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 font-semibold text-zinc-100 hover:bg-white/10"
            >
              Sign Up
            </a>
          </div>
        )}
      </main>
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        {/* Hero Section */}
        <section className="flex min-h-screen items-center justify-center">
          <main className="flex flex-col items-center justify-center gap-8 p-8 text-center">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              Stellar Insured
            </h1>
            <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
              Decentralized insurance platform built on Stellar
            </p>
          </main>
        </section>
      </div>
        {/* How It Works Section */}
      <div className="min-h-screen bg-[#0A0E27]">
        <HeroSection />
        <HowItWorksSection />
      </div>
    </div>
  );
}
