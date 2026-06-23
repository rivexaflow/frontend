import type { Metadata } from "next";
import Link from "next/link";
import { Check, Crown, Shield, Zap } from "lucide-react";

import { FloatingMarketingNav } from "@/components/marketing/floating-marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Button } from "@/components/ui/button";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export const metadata: Metadata = {
  title: "Pricing | Rivexaflow",
  description:
    "Transparent INR pricing for teams adopting Rivexaflow — CRM, KYC, billing, and AI in one workspace.",
};

const TIERS = [
  {
    name: "Starter",
    price: "₹50",
    period: "per month",
    seats: "Up to 25 seats",
    icon: <Zap className="h-6 w-6 text-[#2277FF]" />,
    features: [
      "CRM + KYC Essentials",
      "Standard Email Support",
      "Core Business Reports",
      "Single Workspace",
    ],
    cta: "Start Free Trial",
    href: "/login",
    popular: false,
  },
  {
    name: "Growth",
    price: "₹100",
    period: "per month",
    seats: "Up to 120 seats",
    icon: <Shield className="h-6 w-6 text-[#2277FF]" />,
    features: [
      "Advanced AI Modules",
      "Priority SLA Support",
      "Live Performance Monitoring",
      "Multiple Workspaces",
      "Custom Workflows",
    ],
    cta: "Scale Now",
    href: "/login",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "annual billing",
    seats: "Unlimited scale",
    icon: <Crown className="h-6 w-6 text-[#191970]" />,
    features: [
      "Dedicated Success Manager",
      "Custom API Integrations",
      "Private Audit Logs",
      "White-label Options",
      "Enterprise Security",
    ],
    cta: "Contact Sales",
    href: "/contact",
    popular: false,
  },
] as const;

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white font-sans text-slate-900 selection:bg-[#2277FF]/15 dark:bg-slate-950 dark:text-slate-50">
      <FloatingMarketingNav />

      <DottedGlowBackground
        className="opacity-20"
        color="rgba(34, 119, 255, 0.1)"
        glowColor="rgba(34, 119, 255, 0.4)"
        gap={30}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-28 sm:pb-24 sm:pt-32 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2277FF]">Pricing</p>
          <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            Plans that scale with your <span className="text-gradient">workspace</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            Choose the perfect plan for your organization. Transparent INR pricing designed for
            teams of all sizes adopting Rivexaflow.
          </p>
        </div>

        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-10">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col justify-between rounded-3xl p-8 ring-1 transition-all duration-300 hover:scale-[1.01] ${
                tier.popular
                  ? "bg-gradient-to-br from-[#191970] to-[#2277FF] ring-[#2277FF]/40 shadow-[0_28px_80px_rgba(25,25,112,0.28)]"
                  : "bg-white ring-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.06)] dark:bg-slate-900/50 dark:ring-white/10"
              }`}
            >
              {tier.popular ? (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#050a1f] px-4 py-1 text-sm font-semibold text-white shadow-lg">
                  Most Popular
                </div>
              ) : null}

              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h2
                    className={`text-lg font-bold leading-8 ${
                      tier.popular ? "text-white" : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {tier.name}
                  </h2>
                  <div
                    className={`rounded-xl p-2 ${
                      tier.popular ? "bg-white/10" : "bg-[#2277FF]/8"
                    }`}
                  >
                    {tier.icon}
                  </div>
                </div>

                <p className="mt-4 flex items-baseline gap-x-1.5">
                  <span
                    className={`text-4xl font-bold tabular-nums tracking-tight ${
                      tier.popular ? "text-white" : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {tier.price}
                  </span>
                  {tier.price !== "Custom" ? (
                    <span
                      className={`text-sm font-medium ${
                        tier.popular ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      /{tier.period}
                    </span>
                  ) : (
                    <span
                      className={`text-sm font-medium ${
                        tier.popular ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      · {tier.period}
                    </span>
                  )}
                </p>

                <p className={`mt-1 text-sm ${tier.popular ? "text-blue-100/90" : "text-slate-500"}`}>
                  {tier.seats}
                </p>

                <ul
                  role="list"
                  className={`mt-8 space-y-3 text-sm leading-6 ${
                    tier.popular ? "text-slate-200" : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check
                        className={`h-5 w-5 flex-none ${
                          tier.popular ? "text-white" : "text-[#2277FF]"
                        }`}
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant={tier.popular ? "default" : "outline"}
                className={`mt-8 w-full rounded-xl py-6 text-base font-semibold shadow-sm transition-all ${
                  tier.popular
                    ? "bg-white text-[#191970] hover:bg-slate-50"
                    : "border-slate-200 text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                }`}
                asChild
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500">
            Need more?{" "}
            <Link href="/contact" className="font-semibold text-[#2277FF] hover:text-[#0056FF]">
              Contact our sales team
            </Link>{" "}
            for custom enterprise requirements.
          </p>
        </div>
      </div>

      <MarketingFooter />
    </main>
  );
}
