"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  FileText,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type BentoModule = {
  title: string;
  body: string;
  icon: LucideIcon;
  className: string;
  tint: string;
  iconBg: string;
  glow: string;
  featured: boolean;
  metric?: string;
  visual: "crm" | "kyc" | "invoice" | "ai" | "reports";
};

const MODULES: BentoModule[] = [
  {
    title: "CRM & pipeline",
    body: "Leads, contacts, and deals with governed handoffs to compliance and finance.",
    icon: Users,
    className: "md:col-start-1 md:row-start-1",
    tint: "from-[#eef4ff] to-white",
    iconBg: "bg-[#2277FF]",
    glow: "group-hover:shadow-[0_24px_60px_rgba(34,119,255,0.22)]",
    featured: false,
    metric: "+12% pipeline",
    visual: "crm",
  },
  {
    title: "KYC & compliance",
    body: "Individual KYC, business KYB, PEP screening, document verification, and ongoing monitoring—in one queue your auditors can trust.",
    icon: ShieldCheck,
    className: "md:col-start-2 md:row-start-1 md:row-span-2",
    tint: "from-[#f5f3ff] via-[#faf5ff] to-white",
    iconBg: "bg-[#6366f1]",
    glow: "group-hover:shadow-[0_28px_70px_rgba(99,102,241,0.28)]",
    featured: true,
    metric: "38 in queue",
    visual: "kyc",
  },
  {
    title: "Smart invoicing",
    body: "Issue, track, and reconcile invoices with real-time status across entities.",
    icon: FileText,
    className: "md:col-start-1 md:row-start-2",
    tint: "from-[#fff7ed] to-white",
    iconBg: "bg-[#f59e0b]",
    glow: "group-hover:shadow-[0_24px_60px_rgba(245,158,11,0.2)]",
    featured: false,
    metric: "$3.0K due",
    visual: "invoice",
  },
  {
    title: "AI workflows",
    body: "Assist reviews, routing, and follow-ups while keeping humans in the approval loop.",
    icon: Sparkles,
    className: "md:col-start-3 md:row-start-1",
    tint: "from-[#ecfdf5] to-white",
    iconBg: "bg-[#10b981]",
    glow: "group-hover:shadow-[0_24px_60px_rgba(16,185,129,0.22)]",
    featured: false,
    metric: "Auto-route",
    visual: "ai",
  },
  {
    title: "Executive reporting",
    body: "Live KPIs for pipeline, KYC turnaround, billing, and team workload.",
    icon: BarChart3,
    className: "md:col-start-3 md:row-start-2",
    tint: "from-[#f1f5f9] to-white",
    iconBg: "bg-[#191970]",
    glow: "group-hover:shadow-[0_24px_60px_rgba(25,25,112,0.2)]",
    featured: false,
    metric: "Live KPIs",
    visual: "reports",
  },
];

function CrmVisual() {
  return (
    <svg viewBox="0 0 120 48" className="h-12 w-full" aria-hidden>
      {[18, 28, 22, 36, 32, 42].map((h, i) => (
        <motion.rect
          key={i}
          x={8 + i * 18}
          width={10}
          rx={3}
          fill="#2277FF"
          initial={{ height: 0, y: 48 }}
          whileInView={{ height: h, y: 48 - h }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
        />
      ))}
    </svg>
  );
}

function KycVisual() {
  return (
    <motion.div
      className="relative mx-auto flex h-28 w-28 items-center justify-center"
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <motion.span
        className="absolute inset-0 rounded-full border-2 border-[#6366f1]/30"
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.15, 0.5] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="absolute inset-2 rounded-full border-2 border-[#6366f1]/45"
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 0.25, 0.7] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
      <motion.div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6366f1] text-white shadow-lg">
        <ShieldCheck className="h-8 w-8" />
      </motion.div>
      {["ID", "PEP", "Doc"].map((label, i) => (
        <motion.span
          key={label}
          className="absolute rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#6366f1] shadow-md ring-1 ring-[#6366f1]/20"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 + i * 0.12 }}
          style={{
            top: i === 0 ? "0%" : i === 1 ? "72%" : "28%",
            left: i === 0 ? "78%" : i === 1 ? "-4%" : "82%",
          }}
        >
          {label}
        </motion.span>
      ))}
    </motion.div>
  );
}

function InvoiceVisual() {
  return (
    <motion.div className="relative h-14 w-full" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 h-10 w-[72%] -translate-x-1/2 rounded-lg border border-amber-200/80 bg-white shadow-sm"
          style={{ top: i * 6, zIndex: 3 - i }}
          initial={{ opacity: 0, y: 16, rotate: -4 + i * 4 }}
          whileInView={{ opacity: 1 - i * 0.15, y: 0, rotate: -3 + i * 3 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 + i * 0.1, duration: 0.45 }}
        >
          <motion.div
            className="mx-2 mt-2 h-1 rounded-full bg-amber-200"
            initial={{ width: 0 }}
            whileInView={{ width: "60%" }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 + i * 0.1, duration: 0.4 }}
          />
          <motion.div
            className="mx-2 mt-1.5 h-1 rounded-full bg-amber-100"
            initial={{ width: 0 }}
            whileInView={{ width: "40%" }}
            viewport={{ once: true }}
            transition={{ delay: 0.45 + i * 0.1, duration: 0.4 }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

function AiVisual() {
  return (
    <div className="relative flex h-14 items-center justify-center gap-3" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-emerald-400"
          animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2 + i * 0.15, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
      <motion.div
        className="absolute -right-1 -top-1 text-emerald-500"
        animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <Sparkles className="h-5 w-5" />
      </motion.div>
    </div>
  );
}

function ReportsVisual() {
  return (
    <svg viewBox="0 0 140 48" className="h-12 w-full overflow-visible" aria-hidden>
      <motion.path
        d="M4 40 L28 28 L52 32 L76 18 L104 22 L136 8"
        fill="none"
        stroke="#191970"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.3 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
      <motion.path
        d="M4 40 L28 28 L52 32 L76 18 L104 22 L136 8 L136 44 L4 44 Z"
        fill="url(#reportFill)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.35 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6 }}
      />
      <defs>
        <linearGradient id="reportFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2277FF" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#2277FF" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

function CardVisual({ type }: { type: BentoModule["visual"] }) {
  switch (type) {
    case "crm":
      return <CrmVisual />;
    case "kyc":
      return <KycVisual />;
    case "invoice":
      return <InvoiceVisual />;
    case "ai":
      return <AiVisual />;
    case "reports":
      return <ReportsVisual />;
  }
}

function BentoCard({ mod, index }: { mod: BentoModule; index: number }) {
  const Icon = mod.icon;
  const reduceMotion = useReducedMotion();

  const cardInner = (
    <motion.article
      layout={!mod.featured}
      initial={mod.featured ? false : { opacity: 0, y: 32, scale: 0.96 }}
      whileInView={mod.featured ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={
        mod.featured
          ? undefined
          : {
              type: "spring",
              stiffness: 260,
              damping: 22,
              delay: index * 0.07,
            }
      }
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.015 }}
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-[1.65rem] border border-white/80 bg-gradient-to-br p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] transition-shadow duration-500",
        mod.tint,
        mod.glow,
        mod.featured && "md:min-h-[320px]",
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/60 blur-2xl transition-transform duration-700 group-hover:scale-125"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 80% 0%, rgba(34,119,255,0.08), transparent 55%)",
        }}
        aria-hidden
      />

      <motion.span
        className="absolute right-5 top-5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 shadow-sm ring-1 ring-slate-100"
        initial={{ opacity: 0, x: 8 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 + index * 0.05 }}
      >
        {mod.metric}
      </motion.span>

      <div className="relative z-10 flex flex-1 flex-col">
        <motion.span
          className={cn(
            "inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg",
            mod.iconBg,
          )}
          whileHover={reduceMotion ? undefined : { rotate: [0, -8, 8, 0], scale: 1.08 }}
          transition={{ duration: 0.45 }}
        >
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </motion.span>

        <div
          className={cn(
            "mt-4 overflow-hidden rounded-xl border border-white/70 bg-white/50 p-3 backdrop-blur-sm",
            mod.featured ? "min-h-[120px]" : "min-h-[72px]",
          )}
        >
          <CardVisual type={mod.visual} />
        </div>

        <h3 className="mt-5 text-xl font-bold text-slate-900">{mod.title}</h3>
        <p
          className={cn(
            "mt-2 flex-1 leading-relaxed text-slate-600",
            mod.featured ? "text-base" : "text-sm",
          )}
        >
          {mod.body}
        </p>

        <Link
          href="/#services"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2277FF]"
        >
          <span className="relative">
            Learn more
            <motion.span
              className="absolute -bottom-0.5 left-0 h-px bg-[#2277FF]"
              initial={{ width: 0 }}
              whileHover={{ width: "100%" }}
            />
          </span>
          <motion.span whileHover={{ x: 2, y: -2 }}>
            <ArrowUpRight className="h-4 w-4" />
          </motion.span>
        </Link>
      </div>
    </motion.article>
  );

  if (!mod.featured) {
    return <div className={cn("relative h-full", mod.className)}>{cardInner}</div>;
  }

  return (
    <div className={cn("relative h-full", mod.className)}>
      <motion.div
        className="pointer-events-none absolute -inset-[2px] rounded-[1.75rem] opacity-80"
        style={{
          background:
            "conic-gradient(from 0deg, #6366f1, #2277FF, #a78bfa, #6366f1)",
        }}
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -inset-[2px] rounded-[1.75rem] opacity-40 blur-md"
        style={{
          background:
            "conic-gradient(from 0deg, #6366f1, #2277FF, #a78bfa, #6366f1)",
        }}
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        aria-hidden
      />
      <motion.div
        className="relative h-full rounded-[1.65rem] bg-white p-[2px]"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 260, damping: 22, delay: index * 0.07 }}
      >
        {cardInner}
      </motion.div>
    </div>
  );
}

export function AboutBentoModules() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <motion.div
        className="pointer-events-none absolute left-[10%] top-20 h-64 w-64 rounded-full bg-[#2277FF]/10 blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute bottom-10 right-[8%] h-72 w-72 rounded-full bg-[#6366f1]/10 blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, -24, 0], y: [0, 16, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(34,119,255,0.07), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(99,102,241,0.08), transparent 42%)
          `,
        }}
        aria-hidden
      />

      <motion.div
        className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#2277FF]/20 to-transparent"
        animate={reduceMotion ? undefined : { opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
        aria-hidden
      />

      <motion.div
        className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#6366f1]/15 to-transparent"
        animate={reduceMotion ? undefined : { opacity: [0.1, 0.4, 0.1], scaleX: [0.8, 1.05, 0.8] }}
        transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.span
            className="inline-block rounded-full bg-[#2277FF]/10 px-4 py-1 text-sm font-bold uppercase tracking-[0.12em] text-[#2277FF]"
            animate={reduceMotion ? undefined : { boxShadow: ["0 0 0 rgba(34,119,255,0)", "0 0 24px rgba(34,119,255,0.25)", "0 0 0 rgba(34,119,255,0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            What we build
          </motion.span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#050a1f] sm:text-4xl">
            Everything your enterprise runs on—
            <motion.span
              className="inline-block text-[#2277FF]"
              animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              connected
            </motion.span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Modular by design. One data model. Full traceability from lead to invoice to audit
            pack.
          </p>
        </motion.div>

        <motion.div
          className="mt-12 grid auto-rows-[minmax(180px,auto)] gap-5 md:grid-cols-3 md:grid-rows-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {MODULES.map((mod, i) => (
            <BentoCard key={mod.title} mod={mod} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
