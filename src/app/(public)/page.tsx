"use client";

import { 
  MarketingHero 
} from "@/components/marketing/marketing-hero";
import { AboutHorizontalSection } from "@/components/marketing/about-horizontal-section";
import { FeatureShowcaseV2 as FeatureShowcase } from "@/components/marketing/feature-showcase-v2";
import { Testimonials } from "@/components/marketing/testimonials";
import { CTASection } from "@/components/marketing/cta-section";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { VisionKineticSection } from "@/components/marketing/vision-kinetic-section";
import { PowerfulServicesSection } from "@/components/marketing/powerful-services-section";
import { BusinessImpactBento } from "@/components/marketing/business-impact-bento";
import { FloatingMarketingNav } from "@/components/marketing/floating-marketing-nav";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="relative flex min-h-[100dvh] flex-col">
        <FloatingMarketingNav />

        <MarketingHero />
        <AboutHorizontalSection />
      </div>

      <FeatureShowcase />

      <VisionKineticSection />

      <PowerfulServicesSection />

      <BusinessImpactBento />

      <Testimonials />
      
      <CTASection />

      <MarketingFooter />
    </main>
  );
}
