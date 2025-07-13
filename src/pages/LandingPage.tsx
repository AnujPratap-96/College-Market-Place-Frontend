// src/pages/Landing.tsx

import HeroSection from "@/components/landing/HeroSection"
import FeaturesSection from "@/components/landing/FeatureSection"
import FAQSection from "@/components/landing/FAQSection"
import CTASection from "@/components/landing/CTASection"
import FooterSection from "@/components/Footer.tsx"

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <HeroSection />
      <FeaturesSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </div>
  )
}
