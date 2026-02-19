"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import HeroSection from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import ReadyToSecureSection from "@/components/ReadyToSecureSection";
import NavBar from "@/components/NavBar/NavBar";

export default function Home() {
  const router = useRouter();
  const { session, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950 relative">
      <NavBar />
      <main className="flex flex-col">
          <HeroSection />
          <HowItWorksSection />
          <ReadyToSecureSection />
        </main>
    </div>
  );
}
