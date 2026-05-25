"use client";

import { AboutBentoModules } from "@/components/marketing/about-bento-modules";
import { AboutCtaSection } from "@/components/marketing/about-cta-section";
import { AboutHeroSection } from "@/components/marketing/about-hero-section";
import { AboutHowItWorks } from "@/components/marketing/about-how-it-works";
import { AboutStoryRecognition } from "@/components/marketing/about-story-recognition";
import { CheckCircle2 } from "lucide-react";

export function AboutPageView() {
  return (
    <div className="overflow-x-clip bg-[#fafbfc] font-sans text-slate-900">
      <AboutHeroSection />
      <AboutBentoModules />

      <AboutHowItWorks />
      <AboutStoryRecognition />

      <section className="border-t border-slate-200/60 bg-white py-12">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-3 px-6 lg:px-10">
          {[
            "98% faster audit prep",
            "Certified workflow governance",
            "Multi-tenant architecture",
            "1.5k+ satisfied operators",
          ].map((pill) => (
            <span
              key={pill}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-[#fafbfc] px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4 text-[#2277FF]" />
              {pill}
            </span>
          ))}
        </div>
      </section>

      <AboutCtaSection />
    </div>
  );
}
