"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  Building2,
  Shield,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

const ABOUT_CARDS = [
  {
    tag: "Who We Are",
    title: "Building the operating system for modern enterprise execution.",
    body: "Rivexaflow unifies CRM, KYC, invoicing, workflow automation, and reporting into one secure workspace.",
    icon: Building2,
    accent: "from-[#2277FF] to-[#4f8cff]",
  },
  {
    tag: "Mission",
    title: "Help teams scale with clarity, speed, and confidence.",
    body: "We remove disconnected tools so teams can run from one source of truth and ship decisions faster.",
    icon: Target,
    accent: "from-[#3b5bdb] to-[#748ffc]",
  },
  {
    tag: "Security",
    title: "Enterprise controls built in from day one.",
    body: "Role-based access, audit visibility, and workflow governance keep compliance strong as operations grow.",
    icon: Shield,
    accent: "from-[#1e3a8f] to-[#2277FF]",
  },
  {
    tag: "Automation",
    title: "AI-assisted execution across daily operations.",
    body: "From follow-ups to verification and invoicing, repetitive work becomes automated and measurable.",
    icon: Zap,
    accent: "from-[#6366f1] to-[#818cf8]",
  },
  {
    tag: "Collaboration",
    title: "Cross-functional teams move as one.",
    body: "Sales, operations, finance, and leadership stay aligned with live insights and shared workflows.",
    icon: Users,
    accent: "from-[#2277FF] to-[#6366f1]",
  },
  {
    tag: "Impact",
    title: "Operational complexity converted into growth.",
    body: "Customers reduce manual effort, improve turnaround times, and gain real-time business visibility.",
    icon: TrendingUp,
    accent: "from-[#191970] to-[#3949b8]",
  },
] as const;

function AboutInsightCard({
  card,
  index,
}: {
  card: (typeof ABOUT_CARDS)[number];
  index: number;
}) {
  const Icon = card.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 0.61, 0.36, 1] }}
      className={cn(
        "group relative flex min-h-[272px] flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white",
        "shadow-[0_1px_2px_rgba(15,23,42,0.06),0_6px_16px_rgba(15,23,42,0.07),0_14px_36px_rgba(34,119,255,0.1),0_28px_56px_rgba(25,25,112,0.08)]",
        "ring-1 ring-white/90 transition duration-300",
        "hover:-translate-y-1 hover:border-[#2277FF]/30",
        "hover:shadow-[0_2px_4px_rgba(15,23,42,0.07),0_10px_24px_rgba(34,119,255,0.14),0_22px_48px_rgba(34,119,255,0.16),0_36px_72px_rgba(25,25,112,0.12)]",
      )}
    >
      <div
        className={cn("h-1 w-full bg-gradient-to-r", card.accent)}
        aria-hidden
      />

      <div className="relative flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-[0_4px_14px_rgba(34,119,255,0.35)]",
              card.accent,
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </div>
          <span className="font-mono text-sm font-medium tabular-nums text-slate-300">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2277FF]">
          {card.tag}
        </p>
        <h3 className="mt-2 font-sans text-lg font-bold leading-snug text-slate-900 sm:text-[1.3rem] sm:leading-[1.35]">
          {card.title}
        </h3>
        <p className="mt-3 text-[15px] leading-[1.65] text-slate-600">{card.body}</p>
      </div>

      <div
        className="pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-[#2277FF]/[0.06] blur-2xl transition-opacity group-hover:opacity-100"
        aria-hidden
      />
    </motion.article>
  );
}

export function AboutHorizontalSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const titleX = useTransform(scrollYProgress, [0, 1], ["14%", "-68%"]);
  const titleX2 = useTransform(scrollYProgress, [0, 1], ["4%", "-58%"]);
  const panelY = useTransform(scrollYProgress, [0, 1], [64, -18]);

  return (
    <section ref={sectionRef} id="about" className="relative min-h-[175vh] bg-white">
      <div className="sticky top-16 overflow-hidden border-y border-[#E3E7FC] bg-white/96 py-10 backdrop-blur-sm">
        <motion.h2
          style={{ x: titleX }}
          className="font-heading whitespace-nowrap text-[clamp(3.4rem,13vw,13rem)] font-black uppercase tracking-[-0.055em] text-[#191970]/14"
        >
          About Rivexaflow - Enterprise Productivity Reimagined - About Rivexaflow
        </motion.h2>
        <motion.h2
          style={{ x: titleX2 }}
          className="mt-1 font-heading whitespace-nowrap text-[clamp(2.8rem,10.5vw,10rem)] font-black uppercase tracking-[-0.045em] text-[#2277FF]/14"
        >
          Intelligent Workflows - Secure Execution - Measurable Scale
        </motion.h2>
      </div>

      <motion.div
        style={{ y: panelY }}
        className="mx-auto mt-12 grid max-w-7xl gap-5 px-6 pb-24 pt-6 md:grid-cols-2 md:gap-6 xl:grid-cols-3"
      >
        {ABOUT_CARDS.map((card, index) => (
          <AboutInsightCard key={card.title} card={card} index={index} />
        ))}
      </motion.div>
    </section>
  );
}
