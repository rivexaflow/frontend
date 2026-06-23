"use client";

import Link from "next/link";
import { Clock, Mail, MessageSquare, Phone, Send, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

import { FloatingMarketingNav } from "@/components/marketing/floating-marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Button } from "@/components/ui/button";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: "solutions@rivexaflow.com",
    href: "mailto:solutions@rivexaflow.com",
    hint: "Enterprise & rollout enquiries",
  },
  {
    icon: Phone,
    label: "Sales",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
    hint: "Mon–Fri, 9am–6pm IST",
  },
  {
    icon: MessageSquare,
    label: "Support",
    value: "24/7 for Growth & Enterprise",
    hint: "Priority SLA on paid plans",
  },
] as const;

const TRUST_POINTS = [
  "Response within one business day",
  "SOC-ready workspace governance",
  "Dedicated rollout guidance",
] as const;

const inputClass =
  "block w-full rounded-xl border-0 bg-slate-50 px-4 py-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 transition focus:ring-2 focus:ring-inset focus:ring-[#2277FF] sm:text-sm dark:bg-slate-900 dark:text-white dark:ring-white/10";

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fafbfc] font-sans text-slate-900 selection:bg-[#2277FF]/15 dark:bg-slate-950 dark:text-slate-50">
      <FloatingMarketingNav />

      <DottedGlowBackground
        className="opacity-15"
        color="rgba(34, 119, 255, 0.1)"
        glowColor="rgba(34, 119, 255, 0.35)"
        gap={30}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-28 sm:pb-24 sm:pt-32 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-5"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2277FF]">
              Get in touch
            </p>
            <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Let&apos;s build your <span className="text-gradient">future workspace</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Tell us about your rollout timeline and operational requirements. Our solutions team
              will respond within one business day.
            </p>

            <div className="mt-8 space-y-3">
              {CONTACT_CHANNELS.map((channel) => {
                const Icon = channel.icon;
                const content = (
                  <div className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-[#2277FF]/25 hover:shadow-md">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2277FF]/10 text-[#2277FF]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {channel.label}
                      </p>
                      <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                        {channel.value}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-500">{channel.hint}</p>
                    </div>
                  </div>
                );

                return "href" in channel && channel.href ? (
                  <a key={channel.label} href={channel.href} className="block">
                    {content}
                  </a>
                ) : (
                  <div key={channel.label}>{content}</div>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl border border-[#2277FF]/15 bg-[#2277FF]/5 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#191970]">
                <ShieldCheck className="h-4 w-4 text-[#2277FF]" />
                Enterprise-ready from day one
              </div>
              <ul className="mt-3 space-y-2">
                {TRUST_POINTS.map((point) => (
                  <li key={point} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2277FF]" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <Clock className="h-4 w-4 text-[#2277FF]" />
              Prefer self-serve?{" "}
              <Link href="/pricing" className="font-semibold text-[#2277FF] hover:text-[#0056FF]">
                View pricing
              </Link>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="lg:col-span-7"
          >
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white shadow-[0_24px_70px_rgba(25,25,112,0.1)] dark:border-white/10 dark:bg-slate-900/60">
              <div className="h-1 bg-gradient-to-r from-[#191970] via-[#2277FF] to-[#0056FF]" aria-hidden />
              <div className="p-8 sm:p-10">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Send us a message
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Share your team size, modules of interest, and go-live timeline.
                </p>

                <form action="#" method="POST" className="mt-8 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="first-name"
                        className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
                      >
                        First name
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="first-name"
                          id="first-name"
                          autoComplete="given-name"
                          placeholder="Priya"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="last-name"
                        className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
                      >
                        Last name
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="last-name"
                          id="last-name"
                          autoComplete="family-name"
                          placeholder="Sharma"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      Company
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="company"
                        id="company"
                        autoComplete="organization"
                        placeholder="Your organization"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      Work email
                    </label>
                    <div className="mt-2">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        autoComplete="email"
                        placeholder="you@company.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      How can we help?
                    </label>
                    <div className="mt-2">
                      <textarea
                        name="message"
                        id="message"
                        rows={5}
                        placeholder="CRM rollout, KYC workflows, seat count, target go-live…"
                        className={inputClass}
                        defaultValue=""
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-xl bg-[#191970] py-6 text-base font-semibold text-white shadow-lg transition hover:bg-[#050a1f]"
                  >
                    Send message
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <MarketingFooter />
    </main>
  );
}
