import { HowItWorksSection } from '@/components/HowItWorksSection';

export default function Home() {
  return (
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

      {/* How It Works Section */}
      <HowItWorksSection />
    </div>
  );
}
