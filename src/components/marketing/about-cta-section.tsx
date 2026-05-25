"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";

const TRUST_POINTS = [
  "No credit card required",
  "Enterprise SSO ready",
  "Audit trails included",
] as const;

function CtaPlatformVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, delay: 0.15 }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#2277FF]/35 via-[#6366f1]/15 to-transparent blur-2xl"
        animate={reduceMotion ? undefined : { opacity: [0.45, 0.75, 0.45] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      <motion.div
        className="absolute -left-3 top-8 z-10 hidden rounded-xl border border-white/20 bg-white/95 px-3 py-2 shadow-xl backdrop-blur-sm sm:block"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.45 }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Modules live</p>
        <p className="text-sm font-extrabold text-[#2277FF]">6 / 6</p>
      </motion.div>

      <motion.div
        className="absolute -right-2 bottom-16 z-10 hidden rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 shadow-xl sm:block"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.55 }}
      >
        <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
          <TrendingUp className="h-3 w-3" />
          Ops velocity
        </p>
        <p className="text-sm font-extrabold text-emerald-600">+24%</p>
      </motion.div>

      <motion.div
        className="relative overflow-hidden rounded-[1.65rem] border border-white/15 bg-white shadow-[0_28px_70px_rgba(0,0,0,0.35)]"
        whileHover={reduceMotion ? undefined : { y: -3 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
      >
        <motion.div className="border-b border-slate-100 bg-gradient-to-r from-[#f8faff] to-white px-4 py-3.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>

          <motion.div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#2277FF] text-[10px] font-bold text-white">
                RH
              </span>
              <motion.div>
                <p className="text-xs font-bold text-slate-900">Rivexaflow HQ</p>
                <p className="text-[10px] font-medium text-slate-500">Governed workspace</p>
              </motion.div>
            </div>

            <motion.span
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100"
              animate={reduceMotion ? undefined : { scale: [1, 1.03, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </motion.span>
          </motion.div>
        </motion.div>

        <div className="space-y-3 p-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "CRM deals", val: "142", tone: "text-[#2277FF]" },
              { label: "KYC cleared", val: "98%", tone: "text-emerald-600" },
              { label: "Invoices", val: "$48K", tone: "text-amber-600" },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 + i * 0.07 }}
                className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5"
              >
                <p className="text-[9px] font-medium text-slate-500">{m.label}</p>
                <p className={cn("text-sm font-bold", m.tone)}>{m.val}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45 }}
            className="rounded-xl border border-slate-100 bg-gradient-to-r from-[#eef4ff] to-white p-3"
          >
            <motion.div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Governance feed
              </p>
              <Activity className="h-3.5 w-3.5 text-[#2277FF]" />
            </motion.div>
            <ul className="mt-2 space-y-2">
              {[
                { text: "Policy check passed", time: "Just now", tone: "bg-emerald-500" },
                { text: "Invoice #2201 approved", time: "4m ago", tone: "bg-[#2277FF]" },
                { text: "KYC routed to compliance", time: "12m ago", tone: "bg-amber-400" },
              ].map((item, i) => (
                <motion.li
                  key={item.text}
                  initial={{ opacity: 0, x: 6 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex items-center justify-between gap-2 text-[10px]"
                >
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <span className={cn("h-1.5 w-1.5 rounded-full", item.tone)} />
                    {item.text}
                  </span>
                  <span className="shrink-0 text-slate-400">{item.time}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <div className="flex items-center justify-between rounded-xl border border-[#2277FF]/15 bg-[#2277FF]/5 px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[#2277FF]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Audit-ready surface
            </span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 shadow-sm">
              SOC path
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AboutCtaSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="px-6 pb-20 pt-8 sm:px-8 sm:pb-28 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-48px" }}
        transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#050a1f] px-6 py-12 sm:px-10 sm:py-14 lg:px-12 lg:py-16"
      >
        <motion.div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#2277FF]/25 blur-3xl"
          animate={reduceMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.5, 0.75, 0.5] }}
          transition={{ duration: 6, repeat: Infinity }}
          aria-hidden
        />
        <motion.div
          className="pointer-events-none absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-[#6366f1]/20 blur-3xl"
          animate={reduceMotion ? undefined : { scale: [1, 1.1, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 7, repeat: Infinity, delay: 1 }}
          aria-hidden
        />

        <motion.div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden
        />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-12 xl:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-blue-200 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#2277FF]" />
              Get started
            </span>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Ready to run your enterprise on one governed surface?
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-300">
              Join teams that unified CRM, KYC, and billing without sacrificing the controls their
              auditors require.
            </p>

            <ul className="mt-6 space-y-2.5">
              {TRUST_POINTS.map((point, i) => (
                <motion.li
                  key={point}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  className="flex items-center gap-2.5 text-sm font-medium text-slate-300"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2277FF]" />
                  {point}
                </motion.li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#2277FF] px-7 py-3.5 text-base font-semibold text-white shadow-[0_12px_32px_rgba(34,119,255,0.35)] transition hover:bg-[#1d6ae6]"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                View pricing
              </Link>
            </div>
          </div>

          <CtaPlatformVisual />
        </div>
      </motion.div>
    </section>
  );
}
