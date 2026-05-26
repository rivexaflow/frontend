import type { Metadata } from "next";

import { AboutPageView } from "@/components/marketing/about-page-view";
import { FloatingMarketingNav } from "@/components/marketing/floating-marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const metadata: Metadata = {
  title: "About Us | Rivexaflow",
  description:
    "Learn how Rivexaflow unifies CRM, KYC, invoicing, and AI workflows into one governed enterprise workspace.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <FloatingMarketingNav />
      <AboutPageView />
      <MarketingFooter />
    </main>
  );
}
