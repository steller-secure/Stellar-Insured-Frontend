"use client";

import HeroSection from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import KeyFeaturesSection from "@/components/KeyFeaturesSection";
import InsuranceCategoriesSection from "@/components/InsuranceCategoriesSection";
import ReadyToSecureSection from "@/components/ReadyToSecureSection";
import FeaturePageSectionThree from "@/components/FeaturePageSectionThree";
import SecureAsset from "@/components/SecureAsset";
import NavBar from "@/components/NavBar/NavBar";
import Footer from "@/components/footer";
import { RealtimeStatus } from "@/components/RealtimeStatus";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-surface bg-brand-wash">
      <NavBar />
      <RealtimeStatus className="absolute right-4 top-20 z-10" />
      <main className="flex flex-col">
      {/* id="main-content" is the skip-link target from layout.tsx */}
      <main id="main-content" className="flex flex-col" tabIndex={-1}>
        <HeroSection />
        <SecureAsset />
        <HowItWorksSection />
        <KeyFeaturesSection />
        <InsuranceCategoriesSection />
        <FeaturePageSectionThree />
        <ReadyToSecureSection />
        <Footer />
      </main>
    </div>
  );
}
