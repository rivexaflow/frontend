"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Award,
  Building2,
  Layers,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";

import { cn } from "@/lib/utils";

const STORY_STATS = [
  { value: "12→1", label: "Tools consolidated" },
  { value: "6 wk", label: "Avg. rollout" },
  { value: "99.9%", label: "Uptime SLA" },
] as const;

const RECOGNITION = [
  {
    title: "Enterprise-ready controls",
    body: "SOC-ready access, immutable audit visibility, and policy-aware routing across modules.",
    icon: ShieldCheck,
    tag: "Security",
    accent: "from-[#2277FF]/8 to-white",
    iconBg: "bg-[#2277FF]/10 text-[#2277FF]",
    ring: "group-hover:ring-[#2277FF]/25",
  },
  {
    title: "Compliance operations medal",
    body: "Recognized by regulated B2B teams for faster KYC without losing review quality.",
    icon: Award,
    tag: "Compliance",
    accent: "from-[#6366f1]/8 to-white",
    iconBg: "bg-[#6366f1]/10 text-[#6366f1]",
    ring: "group-hover:ring-[#6366f1]/25",
  },
  {
    title: "Operations platform of the year",
    body: "Unified CRM, billing, and compliance in a single governed surface.",
    icon: Trophy,
    tag: "Operations",
    accent: "from-amber-400/10 to-white",
    iconBg: "bg-amber-400/10 text-amber-600",
    ring: "group-hover:ring-amber-400/30",
  },
] as const;

function StoryPlatformVisual() {
  const tools = ["CRM", "KYC", "Billing", "AI", "Reports", "Audit"];

  return (
    <motion.div
      className="relative mt-8 overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.35, duration: 0.5 }}
      aria-hidden
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-semibold text-white/90">
          <Layers className="h-3.5 w-3.5" />
          Workspace modules
        </span>
        <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
          Live
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tools.map((tool, i) => (
          <motion.span
            key={tool}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + i * 0.05 }}
            className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/95"
          >
            {tool}
          </motion.span>
        ))}
      </div>
      <motion.div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7 }}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-white/60 to-white/90"
          initial={{ width: "0%" }}
          whileInView={{ width: "88%" }}
          viewport={{ once: true }}
          transition={{ delay: 0.75, duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
        />
      </motion.div>
      <p className="mt-2 text-[10px] font-medium text-white/60">88% ops unified on one surface</p>
    </motion.div>
  );
}

function StoryCard() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      className="group relative flex min-h-[420px] flex-col overflow-hidden rounded-[1.75rem] border border-[#2277FF]/20 bg-gradient-to-br from-[#050a1f] via-[#191970] to-[#2277FF] p-8 shadow-[0_32px_90px_rgba(34,119,255,0.28)] sm:p-10 lg:min-h-[480px]"
    >
      <motion.div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#6366f1]/40 blur-3xl"
        animate={reduceMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[#2277FF]/30 blur-3xl"
        animate={reduceMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, delay: 1 }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />

      <div className="relative flex flex-wrap gap-3">
        {STORY_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-sm"
          >
            <p className="text-lg font-extrabold text-white">{stat.value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="relative mt-auto pt-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-blue-100 backdrop-blur-sm">
          <Building2 className="h-3.5 w-3.5" />
          Our story
        </span>
        <h2 className="mt-4 text-2xl font-extrabold leading-[1.15] text-white sm:text-3xl lg:text-[2rem]">
          One workspace replaced twelve tools for our first enterprise cohort
        </h2>
        <p className="mt-4 max-w-md text-base leading-relaxed text-blue-100/85">
          We built Rivexaflow after watching regulated teams duct-tape CRM, KYC, and billing—and
          still fail audits. One governed surface changed that.
        </p>

        <StoryPlatformVisual />

        <Link
          href="/contact"
          className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#050a1f] shadow-lg shadow-black/20 transition hover:bg-blue-50 hover:shadow-xl"
        >
          Visit our solutions team
          <ArrowUpRight className="h-4 w-4 text-[#2277FF]" />
        </Link>
      </div>
    </motion.article>
  );
}

function RecognitionCard({
  item,
  index,
}: {
  item: (typeof RECOGNITION)[number];
  index: number;
}) {
  const Icon = item.icon;
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-32px" }}
      transition={{ type: "spring", stiffness: 280, damping: 26, delay: index * 0.08 }}
      whileHover={reduceMotion ? undefined : { x: 4 }}
      className={cn(
        "group relative overflow-hidden rounded-[1.35rem] border border-slate-200/90 bg-gradient-to-br p-6 shadow-[0_8px_32px_rgba(15,23,42,0.05)] transition-all duration-300 hover:border-slate-300 hover:shadow-[0_20px_50px_rgba(34,119,255,0.12)] sm:p-7",
        item.accent,
        item.ring,
        "ring-1 ring-transparent",
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ring-slate-100",
            item.iconBg,
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {item.tag}
            </span>
            <span className="font-mono text-sm font-bold text-slate-200 transition-colors group-hover:text-[#2277FF]/40">
              0{index + 1}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-bold text-slate-900">{item.title}</h3>
          <p className="mt-2 text-base leading-relaxed text-slate-600">{item.body}</p>
        </div>

        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition group-hover:border-[#2277FF]/30 group-hover:bg-[#2277FF]/5 group-hover:text-[#2277FF]">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <motion.div
        className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[#2277FF] to-[#6366f1]"
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.35 }}
        aria-hidden
      />
    </motion.article>
  );
}

function RecognitionPanel() {
  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-[#2277FF]/10 px-4 py-1 text-sm font-bold uppercase tracking-[0.12em] text-[#2277FF]">
          <Sparkles className="h-3.5 w-3.5" />
          Recognition
        </span>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#050a1f] sm:text-3xl">
          Awards & standards we hold ourselves to
        </h2>
        <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-600">
          Security, compliance, and operations teams evaluate us on the same bar they use for
          enterprise vendors—not startup demos.
        </p>
      </motion.div>

      <div className="space-y-4">
        {RECOGNITION.map((item, i) => (
          <RecognitionCard key={item.title} item={item} index={i} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35 }}
        className="flex flex-wrap gap-2 pt-2"
      >
        {["SOC-ready", "Immutable audit", "Multi-tenant"].map((badge) => (
          <span
            key={badge}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm"
          >
            {badge}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function AboutStoryRecognition() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,119,255,0.06),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-12 xl:gap-14">
          <StoryCard />
          <RecognitionPanel />
        </div>
      </div>
    </section>
  );
}
