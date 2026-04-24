"use client";

import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import Link from "next/link";
import { 
  MarketingHero 
} from "@/components/marketing/marketing-hero";
import { LogoCloud } from "@/components/marketing/logo-cloud";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { Testimonials } from "@/components/marketing/testimonials";
import { CTASection } from "@/components/marketing/cta-section";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { NoiseBackground } from "@/components/ui/noise-background";
import { Button } from "@/components/ui/button";
import { StatefulButton } from "@/components/ui/stateful-button";
import { 
  Target, 
  Lock, 
  Bot, 
  Users, 
  Search, 
  FileText, 
  MessageSquare, 
  Brain, 
  Zap,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import * as motion from "framer-motion/client";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="flex min-h-[100dvh] flex-col">
        <nav className="sticky top-0 z-20 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex min-w-0 items-baseline gap-2 sm:gap-3">
              <p className="truncate text-xl font-bold tracking-tight text-blue-600">Rivexaflow</p>
              <p className="hidden truncate text-[10px] font-medium uppercase tracking-widest text-slate-500 sm:inline">
                AI-Driven Enterprise Workspace
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-6">
              <div className="hidden items-center gap-6 md:flex">
                <Link href="/about" className="text-sm font-medium text-slate-600 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
                  About
                </Link>
                <Link href="/pricing" className="text-sm font-medium text-slate-600 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
                  Pricing
                </Link>
                <Link href="/contact" className="text-sm font-medium text-slate-600 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
                  Contact
                </Link>
              </div>
              <Button asChild size="sm" variant="outline" className="hidden sm:flex border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </nav>

        <MarketingHero />
        <LogoCloud />
      </div>

      <FeatureShowcase />

      <section id="vision" className="relative py-24 sm:py-32 overflow-hidden bg-white">
        <DottedGlowBackground 
          className="opacity-40" 
          color="rgba(0, 86, 255, 0.08)"
          glowColor="rgba(0, 86, 255, 0.5)"
          gap={35}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-base font-semibold leading-7 text-blue-600">Our Vision</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              The future of <span className="text-gradient">enterprise productivity</span>
            </p>
            <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
              We're building a unified infrastructure where AI and human expertise collaborate seamlessly to drive business outcomes.
            </p>
          </motion.div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Unified Workspace",
                description: "Eliminate tool sprawl with a single intelligent environment for all operations.",
                icon: <Target className="h-8 w-8" />,
                color: "blue"
              },
              {
                title: "Secure Collaboration", 
                description: "Enterprise-grade security with granular role-based access for every team member.",
                icon: <Lock className="h-8 w-8" />,
                color: "indigo"
              },
              {
                title: "AI-First Design",
                description: "Deeply integrated AI assistants that learn and automate your specific workflows.",
                icon: <Bot className="h-8 w-8" />,
                color: "cyan"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50"
              >
                <div className={`mb-6 inline-flex rounded-2xl bg-${item.color}-50 p-3 text-${item.color}-600 dark:bg-${item.color}-900/20 dark:text-${item.color}-400`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="relative py-24 sm:py-32 bg-slate-50 overflow-hidden dark:bg-slate-900/10">
        <DottedGlowBackground 
          className="opacity-30" 
          color="rgba(0, 86, 255, 0.05)"
          glowColor="rgba(0, 86, 255, 0.4)"
          gap={40}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-base font-semibold leading-7 text-blue-600">Powerful Services</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              One platform, <span className="text-gradient">endless capabilities</span>
            </p>
          </motion.div>

          <BentoGrid className="mx-auto">
            {[
              {
                title: "Advanced CRM",
                description: "End-to-end lead lifecycle management with automated follow-ups and scoring.",
                icon: <Users className="h-4 w-4 text-blue-500" />,
                className: "md:col-span-2",
                header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-20" />
              },
              {
                title: "Digital KYC",
                description: "Accelerated verification protocols with automated document analysis.",
                icon: <Search className="h-4 w-4 text-indigo-500" />,
                className: "md:col-span-1",
                header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 opacity-20" />
              },
              {
                title: "Smart Invoicing",
                description: "Automated billing cycles with real-time tracking and multi-currency support.",
                icon: <FileText className="h-4 w-4 text-purple-500" />,
                className: "md:col-span-1",
                header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-20" />
              },
              {
                title: "Doc Intelligence",
                description: "AI-powered data extraction and validation from any business document.",
                icon: <Brain className="h-4 w-4 text-green-500" />,
                className: "md:col-span-2",
                header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 opacity-20" />
              },
              {
                title: "Omnichannel Comms",
                description: "WhatsApp, Email, and SMS automation integrated directly into workflows.",
                icon: <MessageSquare className="h-4 w-4 text-orange-500" />,
                className: "md:col-span-1",
                header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-orange-500 to-red-500 opacity-20" />
              },
              {
                title: "Workflow Engine",
                description: "Visual builder for complex business processes across all connected modules.",
                icon: <Zap className="h-4 w-4 text-yellow-500" />,
                className: "md:col-span-1",
                header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 opacity-20" />
              }
            ].map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className={item.className}
              />
            ))}
          </BentoGrid>
        </div>
      </section>

      <section id="impact" className="relative py-24 sm:py-32">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-base font-semibold leading-7 text-blue-600">Business Impact</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Measurable growth for modern organizations
              </p>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">
                Our partners see immediate improvements in operational efficiency and team productivity upon implementation.
              </p>
              <div className="mt-10 space-y-4">
                {[
                  "Reduction in manual entry errors by up to 85%",
                  "Increase in lead conversion rates by 2.4x",
                  "Automated verification processes saving 20+ hours weekly",
                  "Real-time governance and compliance reporting"
                ].map((text) => (
                  <div key={text} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-none" />
                    <span className="text-slate-700 dark:text-slate-300">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["42%", "Faster KYC"],
                ["55%", "Less Manual Work"],
                ["2.4x", "Team Visibility"],
                ["99.9%", "Platform Uptime"]
              ].map(([value, label], idx) => (
                <motion.div 
                  key={label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <p className="text-4xl font-bold text-blue-600">{value}</p>
                  <p className="mt-2 text-sm font-medium text-slate-500 uppercase tracking-tighter">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Testimonials />
      
      <CTASection />

      <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2">
            <p className="text-sm font-semibold text-blue-600">Rivexaflow</p>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-slate-500">
              &copy; 2026 Rivexaflow. Enterprise Multi-Tenant AI Workspace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
