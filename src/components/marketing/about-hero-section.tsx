"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Building2,
  Play,
  ShieldCheck,
  Star,
  Users,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";

const HERO_STATS = [
  { icon: Users, value: "10K+", label: "Active workspaces", tone: "from-[#2277FF]/15 to-[#2277FF]/5" },
  { icon: Star, value: "4.9", label: "Customer satisfaction", tone: "from-amber-400/15 to-amber-400/5" },
  { icon: Zap, value: "40%", label: "Faster KYC cycles", tone: "from-emerald-400/15 to-emerald-400/5" },
] as const;

const DARK_STATS = [
  { value: "3M+", label: "Workflow actions / mo" },
  { value: "50+", label: "Enterprise deployments" },
  { value: "99.9%", label: "Platform uptime SLA" },
] as const;

const TRUST_MARKS = [
  { name: "FinScale", abbr: "FS" },
  { name: "NovaPay", abbr: "NP" },
  { name: "ClearPath", abbr: "CP" },
  { name: "AxisOps", abbr: "AO" },
  { name: "LedgerOne", abbr: "LO" },
] as const;

const MODULE_TABS = ["Overview", "CRM", "KYC", "Invoices"] as const;

function PlatformPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.15 }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-[#2277FF]/25 via-[#6366f1]/10 to-transparent blur-2xl"
        animate={reduceMotion ? undefined : { opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      <motion.div
        className="relative overflow-hidden rounded-[1.85rem] border border-slate-200/90 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.14)]"
        whileHover={reduceMotion ? undefined : { y: -4 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
      >
        <motion.div className="border-b border-slate-100 bg-gradient-to-r from-[#fafbff] to-white px-4 py-3 sm:px-5">
          <p className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#2277FF] text-[10px] font-bold text-white">
                AH
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900">Acme Holdings</p>
                <p className="text-[10px] font-medium text-slate-500">Production workspace</p>
              </div>
            </div>

            <motion.span
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100"
              animate={reduceMotion ? undefined : { scale: [1, 1.03, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Governed
            </motion.span>

            <span className="inline-flex items-center gap-1 rounded-full bg-[#2277FF]/10 px-3 py-1.5 text-[10px] font-semibold text-[#2277FF]">
              <ShieldCheck className="h-3 w-3" />
              Audit-ready
            </span>
          </div>

          <div className="mt-3 flex gap-1 overflow-x-auto pb-0.5">
            {MODULE_TABS.map((tab, i) => (
              <span
                key={tab}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors",
                  i === 0 ? "bg-[#2277FF] text-white shadow-sm" : "bg-slate-100 text-slate-600",
                )}
              >
                {tab}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="grid min-h-[300px] grid-cols-[128px_1fr] sm:min-h-[340px]">
          <aside className="border-r border-slate-100 bg-[#f8faff] p-3">
            {["Dashboard", "CRM", "KYC", "Invoices", "Reports"].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className={cn(
                  "mb-1 rounded-lg px-2.5 py-2 text-[11px] font-semibold",
                  i === 0 ? "bg-white text-[#2277FF] shadow-sm ring-1 ring-[#2277FF]/15" : "text-slate-500",
                )}
              >
                {item}
              </motion.div>
            ))}
          </aside>

          <div className="space-y-3 p-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Revenue", val: "$124K", up: "+12%", upTone: "text-emerald-600" },
                { label: "KYC queue", val: "38", up: "−18%", upTone: "text-emerald-600" },
                { label: "Invoices", val: "$3.0K", up: "Due 6d", upTone: "text-amber-600" },
              ].map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                  className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm"
                >
                  <p className="text-[10px] font-medium text-slate-500">{m.label}</p>
                  <p className="text-sm font-bold text-slate-900">{m.val}</p>
                  <p className={cn("text-[10px] font-semibold", m.upTone)}>{m.up}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="rounded-xl border border-slate-100 bg-gradient-to-r from-[#eef4ff] to-white p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Live operations feed
                </p>
                <Activity className="h-3.5 w-3.5 text-[#2277FF]" />
              </div>
              <ul className="mt-2 space-y-2">
                {[
                  { text: "KYC-8824 approved", time: "2m ago", tone: "bg-emerald-500" },
                  { text: "Invoice #1042 sent", time: "14m ago", tone: "bg-[#2277FF]" },
                  { text: "Lead routed to compliance", time: "1h ago", tone: "bg-amber-400" },
                ].map((item, i) => (
                  <motion.li
                    key={item.text}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 + i * 0.1 }}
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

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Compliance ring
                </p>
                <motion.div className="mt-2 flex items-center gap-3">
                  <motion.div
                    className="relative h-14 w-14 rounded-full border-[5px] border-[#2277FF] border-r-slate-200"
                    animate={reduceMotion ? undefined : { rotate: [0, 360] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    style={{ borderRightColor: "rgb(226 232 240)" }}
                  />
                  <div className="space-y-1 text-[10px] text-slate-600">
                    <p>Verified 62%</p>
                    <p>In review 28%</p>
                    <p>Pending 10%</p>
                  </div>
                </motion.div>
              </div>
              <div className="flex flex-col justify-center rounded-xl border border-[#2277FF]/15 bg-[#2277FF]/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2277FF]">
                  Next approval
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">KYB — NovaPay Ltd</p>
                <p className="mt-1 text-[10px] text-slate-500">Assigned to compliance lead</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14, x: -10 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 0.45, type: "spring", stiffness: 220 }}
        className="absolute -bottom-6 -left-5 max-w-[200px] rounded-2xl border border-white/90 bg-white/95 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.14)] backdrop-blur-md sm:-left-10"
      >
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#050a1f] text-xs font-bold text-white">
            R
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#2277FF]">Our mission</p>
            <p className="text-sm font-bold leading-snug text-slate-900">Governed speed for ops teams</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="absolute -right-3 top-10 rounded-2xl border border-[#2277FF]/25 bg-gradient-to-br from-[#2277FF] to-[#4f46e5] px-5 py-4 text-white shadow-xl sm:-right-8"
      >
        <p className="text-3xl font-extrabold leading-none">99.9%</p>
        <p className="mt-1 text-xs font-semibold text-blue-100">Uptime SLA</p>
      </motion.div>
    </motion.div>
  );
}

function DarkStatsBand() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="px-6 py-10 sm:px-8 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55 }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#050a1f] px-8 py-10 sm:px-12 sm:py-12"
      >
        <motion.div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#2277FF]/25 blur-3xl"
          animate={reduceMotion ? undefined : { scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6, repeat: Infinity }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
          aria-hidden
        />

        <div className="relative flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-blue-200">
              <Building2 className="h-3.5 w-3.5" />
              Enterprise operations platform
            </span>
            <p className="mt-4 text-2xl font-extrabold leading-tight text-white sm:text-[2rem]">
              Built for teams that cannot compromise on control
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Every module shares governance, audit trails, and role-safe access—so scale never
              outruns compliance.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 sm:gap-10">
            {DARK_STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.1 }}
                className="text-center sm:text-left"
              >
                <p className="text-2xl font-extrabold text-white sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs font-medium leading-snug text-slate-400 sm:text-sm">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export function AboutHeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200/60 bg-white pt-28 pb-16 sm:pt-32 sm:pb-24">
        <motion.div
          className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#2277FF]/10 blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, 24, 0], y: [0, -16, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
        <motion.div
          className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#6366f1]/10 blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, -20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-20%,rgba(34,119,255,0.1),transparent_60%)]"
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <Link
              href="/#services"
              className="inline-flex items-center gap-2 rounded-full border border-[#2277FF]/20 bg-[#2277FF]/5 px-4 py-1.5 text-sm font-semibold text-[#2277FF] transition hover:bg-[#2277FF]/10"
            >
              <span className="rounded-full bg-[#2277FF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                New
              </span>
              Rivexaflow enterprise workspace →
            </Link>

            <h1 className="mt-6 text-[clamp(2.25rem,5.5vw,3.5rem)] font-extrabold leading-[1.08] tracking-tight text-[#050a1f]">
              Innovative operations with{" "}
              <span className="bg-gradient-to-r from-[#2277FF] to-[#6366f1] bg-clip-text text-transparent">
                care for governance
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              We build the all-in-one workspace for CRM, KYC, invoicing, and AI workflows—so growing
              teams scale without losing audit control or operational clarity.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#2277FF] px-6 py-3.5 text-base font-semibold text-white shadow-[0_12px_32px_rgba(34,119,255,0.35)] transition hover:bg-[#1d6ae6]"
              >
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-800 shadow-sm transition hover:border-[#2277FF]/30 hover:text-[#2277FF]"
              >
                <Play className="h-4 w-4 fill-current" />
                Talk to sales
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {HERO_STATS.map(({ icon: Icon, value, label, tone }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.08 }}
                  className={cn(
                    "rounded-2xl border border-slate-100 bg-gradient-to-br p-4 shadow-[0_8px_28px_rgba(15,23,42,0.05)]",
                    tone,
                  )}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#2277FF] shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-xl font-extrabold text-[#050a1f]">{value}</p>
                  <p className="mt-0.5 text-xs font-medium leading-snug text-slate-500">{label}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-slate-100 bg-[#fafbfc] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Trusted by regulated teams
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {TRUST_MARKS.map(({ name, abbr }) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-2 rounded-xl border border-white bg-white px-3 py-2 shadow-sm"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                      {abbr}
                    </span>
                    <span className="text-sm font-semibold text-slate-600">{name}</span>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="relative lg:pl-2">
            <PlatformPreview />
          </div>
        </div>
      </section>

      <DarkStatsBand />
    </>
  );
}
