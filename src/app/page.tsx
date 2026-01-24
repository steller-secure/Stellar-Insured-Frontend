import HeroSection from "@/components/HeroSection";
import { HowItWorksSection } from '@/components/HowItWorksSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0E27]">
      <HeroSection />
      <HowItWorksSection />
    </div>
  );
}
