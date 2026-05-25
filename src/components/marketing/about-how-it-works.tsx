"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, CheckCircle2, Layers, ShieldCheck, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  {
    step: "Step 1",
    title: "Connect your modules",
    body: "Enable CRM, KYC, invoicing, and AI workflows per workspace—no rip-and-replace required.",
    visual: "modules" as const,
    accent: "from-[#2277FF]/12 to-white",
    ring: "ring-[#2277FF]/20",
  },
  {
    step: "Step 2",
    title: "Apply governance",
    body: "Roles, approvals, and audit trails wrap every action from day one.",
    visual: "governance" as const,
    accent: "from-[#6366f1]/12 to-white",
    ring: "ring-[#6366f1]/20",
  },
  {
    step: "Step 3",
    title: "Scale with confidence",
    body: "Measure outcomes on dashboards leadership and ops both trust.",
    visual: "scale" as const,
    accent: "from-emerald-400/12 to-white",
    ring: "ring-emerald-400/25",
  },
] as const;

function ModulesVisual() {
  const modules = [
    { label: "CRM", on: true },
    { label: "KYC", on: true },
    { label: "Invoices", on: true },
    { label: "AI Ops", on: false },
  ];

  return (
    <motion.div className="space-y-2.5" aria-hidden>
      {modules.map((mod, i) => (
        <motion.div
          key={mod.label}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 + i * 0.08 }}
          className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm"
        >
          <span className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <Layers className="h-3.5 w-3.5 text-[#2277FF]" />
            {mod.label}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              mod.on ? "bg-[#2277FF]/10 text-[#2277FF]" : "bg-slate-100 text-slate-400",
            )}
          >
            {mod.on ? "Enabled" : "Optional"}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}

function GovernanceVisual() {
  const chain = [
    { role: "Sales", status: "Submitted", done: true },
    { role: "Compliance", status: "Reviewing", done: false },
    { role: "Finance", status: "Pending", done: false },
  ];

  return (
    <motion.div className="relative pl-1" aria-hidden>
      <motion.div className="absolute bottom-2 left-[11px] top-2 w-px bg-gradient-to-b from-[#6366f1] via-[#6366f1]/40 to-slate-200" />
      <ul className="space-y-3">
        {chain.map((item, i) => (
          <motion.li
            key={item.role}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="relative flex items-center gap-3"
          >
            <span
              className={cn(
                "relative z-10 grid h-6 w-6 place-items-center rounded-full ring-2 ring-white",
                item.done ? "bg-[#6366f1] text-white" : "bg-white text-slate-300 ring-slate-200",
              )}
            >
              {item.done ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <ShieldCheck className="h-3 w-3" />
              )}
            </span>
            <div className="flex flex-1 items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
              <span className="text-xs font-semibold text-slate-800">{item.role}</span>
              <span className="text-[10px] font-medium text-slate-500">{item.status}</span>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

function ScaleVisual() {
  return (
    <motion.div aria-hidden>
      <div className="mb-3 flex items-end justify-between gap-2">
        {[
          { h: 28, label: "Mon" },
          { h: 42, label: "Tue" },
          { h: 36, label: "Wed" },
          { h: 56, label: "Thu" },
          { h: 48, label: "Fri" },
        ].map((bar, i) => (
          <div key={bar.label} className="flex flex-1 flex-col items-center gap-1">
            <motion.div
              className="w-full rounded-md bg-gradient-to-t from-[#2277FF] to-[#6366f1]"
              initial={{ height: 0 }}
              whileInView={{ height: bar.h }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.07, duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
            />
            <span className="text-[9px] font-medium text-slate-400">{bar.label}</span>
          </div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.55 }}
        className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2"
      >
        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
          <BarChart3 className="h-3.5 w-3.5" />
          KPI trend
        </span>
        <span className="text-xs font-bold text-emerald-600">+24% ops velocity</span>
      </motion.div>
    </motion.div>
  );
}

function StepVisual({ type }: { type: (typeof STEPS)[number]["visual"] }) {
  switch (type) {
    case "modules":
      return <ModulesVisual />;
    case "governance":
      return <GovernanceVisual />;
    case "scale":
      return <ScaleVisual />;
  }
}

function StepCard({
  item,
  index,
}: {
  item: (typeof STEPS)[number];
  index: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: index * 0.1 }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[1.65rem] border border-slate-200/80 bg-gradient-to-b p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(34,119,255,0.12)] sm:p-7",
        item.accent,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#2277FF] shadow-sm ring-1 ring-slate-100">
          <Sparkles className="h-3 w-3" />
          {item.step}
        </span>
        <span className="font-mono text-2xl font-bold text-slate-200 transition-colors group-hover:text-[#2277FF]/30">
          0{index + 1}
        </span>
      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-900">{item.title}</h3>
      <p className="mt-2 flex-1 text-base leading-relaxed text-slate-600">{item.body}</p>

      <div
        className={cn(
          "mt-6 rounded-2xl border bg-white/90 p-4 ring-1 backdrop-blur-sm",
          item.ring,
        )}
      >
        <StepVisual type={item.visual} />
      </div>
    </motion.article>
  );
}

export function AboutHowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-y border-slate-200/60 bg-white py-16 sm:py-24">
      <motion.div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(90%,56rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#2277FF]/25 to-transparent"
        animate={reduceMotion ? undefined : { opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
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
          <span className="inline-block rounded-full bg-[#2277FF]/10 px-4 py-1 text-sm font-bold uppercase tracking-[0.12em] text-[#2277FF]">
            How it works
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#050a1f] sm:text-4xl">
            From rollout to measurable outcomes in{" "}
            <span className="text-[#2277FF]">three moves</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Connect modules, wrap them in governance, then scale with dashboards your leadership
            team actually trusts.
          </p>
        </motion.div>

        <div className="relative mt-14">
          <motion.div
            className="pointer-events-none absolute left-[16.666%] right-[16.666%] top-[4.5rem] hidden h-px bg-gradient-to-r from-[#2277FF]/10 via-[#2277FF]/40 to-[#2277FF]/10 lg:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            aria-hidden
          />

          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            {STEPS.map((item, i) => (
              <StepCard key={item.step} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
