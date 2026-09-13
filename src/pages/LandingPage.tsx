// src/pages/LandingPage.tsx
import HeroSection from "@/components/landing/HeroSection";
import StatsBanner from "@/components/landing/StatsBanner";
import CategoryShowcase from "@/components/landing/CategoryShowcase";
import FeatureSection from "@/components/landing/FeatureSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import SafetySection from "@/components/landing/SafetySection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import FooterSection from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="w-full bg-background text-foreground overflow-x-hidden selection:bg-orange-500 selection:text-white">
      <HeroSection />
      <StatsBanner />
      <CategoryShowcase />
      <FeatureSection />
      <HowItWorksSection />
      <SafetySection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
