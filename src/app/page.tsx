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

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950 relative">
      <NavBar />
      <main className="flex flex-col">
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
