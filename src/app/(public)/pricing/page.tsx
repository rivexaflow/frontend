import Link from "next/link";
import { Check, Zap, Shield, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export default function PricingPage() {
  const tiers = [
    {
      name: "Starter",
      price: "$249",
      period: "per month",
      seats: "Up to 25 seats",
      icon: <Zap className="h-6 w-6 text-blue-500" />,
      features: ["CRM + KYC Essentials", "Standard Email Support", "Core Business Reports", "Single Workspace"],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Growth",
      price: "$749",
      period: "per month",
      seats: "Up to 120 seats",
      icon: <Shield className="h-6 w-6 text-indigo-500" />,
      features: ["Advanced AI Modules", "Priority SLA Support", "Live Performance Monitoring", "Multiple Workspaces", "Custom Workflows"],
      cta: "Scale Now",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "annual billing",
      seats: "Unlimited scale",
      icon: <Crown className="h-6 w-6 text-purple-500" />,
      features: ["Dedicated Success Manager", "Custom API Integrations", "Private Audit Logs", "White-label Options", "Enterprise Security"],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-900 selection:bg-blue-100 dark:bg-slate-950 dark:text-slate-50">
      <DottedGlowBackground 
        className="opacity-20" 
        color="rgba(34, 119, 255, 0.1)"
        glowColor="rgba(34, 119, 255, 0.4)"
        gap={30}
      />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
          <p className="mt-2 font-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            Plans that scale with your <span className="text-gradient">workspace</span>
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Choose the perfect plan for your organization. Transparent pricing designed for teams of all sizes adopting Rivexaflow.
          </p>
        </div>

        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col justify-between rounded-3xl p-8 ring-1 transition-all duration-300 hover:scale-[1.02] ${
                tier.popular 
                ? "bg-blue-600 ring-blue-600 shadow-2xl dark:bg-blue-600 dark:ring-blue-500" 
                : "bg-white ring-slate-200 dark:bg-slate-900/50 dark:ring-white/10"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-1 text-sm font-semibold text-white shadow-lg dark:bg-white dark:text-slate-900">
                  Most Popular
                </div>
              )}
              
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className={`font-heading text-lg font-semibold leading-8 ${tier.popular ? "text-white" : "text-slate-900 dark:text-white"}`}>
                    {tier.name}
                  </h3>
                  <div className={`p-2 rounded-xl ${tier.popular ? "bg-white/10" : "bg-slate-100 dark:bg-slate-800"}`}>
                    {tier.icon}
                  </div>
                </div>
                <p className="mt-4 flex items-baseline gap-x-1">
                  <span className={`font-heading text-4xl font-bold tracking-tight ${tier.popular ? "text-white" : "text-slate-900 dark:text-white"}`}>
                    {tier.price}
                  </span>
                  <span className={`text-sm font-semibold leading-6 ${tier.popular ? "text-blue-100" : "text-slate-600 dark:text-slate-400"}`}>
                    /{tier.period}
                  </span>
                </p>
                <p className={`mt-1 text-xs ${tier.popular ? "text-blue-100" : "text-slate-500"}`}>
                  {tier.seats}
                </p>
                <ul role="list" className={`mt-8 space-y-3 text-sm leading-6 ${tier.popular ? "text-slate-300" : "text-slate-600 dark:text-slate-400"}`}>
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className={`h-6 w-5 flex-none ${tier.popular ? "text-white" : "text-blue-600"}`} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button
                variant={tier.popular ? "default" : "outline"}
                className={`mt-8 w-full rounded-xl py-6 text-base font-semibold shadow-sm transition-all focus-visible:outline-2 ${
                  tier.popular 
                  ? "bg-white text-blue-600 hover:bg-slate-50" 
                  : "border-slate-200 text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                }`}
                asChild
              >
                <Link href="/login">{tier.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500">
            Need more? <Link href="/contact" className="font-semibold text-blue-600 hover:text-blue-500">Contact our sales team</Link> for custom enterprise requirements.
          </p>
        </div>
      </div>
    </main>
  );
}
