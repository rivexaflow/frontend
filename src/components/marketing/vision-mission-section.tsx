"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Compass,
  Heart,
  Sparkles,
  Target,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/utils";

const VISION_PILLARS: { label: string; description: string; icon: LucideIcon }[] = [
  {
    label: "Intelligent",
    description: "AI-assisted workflows that remove friction from daily operations.",
    icon: Sparkles,
  },
  {
    label: "Collaborative",
    description: "Sales, finance, and compliance aligned on one governed surface.",
    icon: Users,
  },
  {
    label: "Human-centered",
    description: "Software that empowers teams — not buries them in process.",
    icon: Heart,
  },
];

const MISSION_POINTS = [
  "One source of truth across CRM, KYC, billing, and reporting.",
  "Faster decisions with live visibility and audit-ready controls.",
  "Scale without sacrificing security, clarity, or team confidence.",
] as const;

const PROOF_STATS = [
  { value: "12→1", label: "Tools consolidated" },
  { value: "6 wk", label: "Avg. rollout" },
  { value: "99.9%", label: "Platform uptime" },
] as const;

function SectionBackdrop({ patternId }: { patternId: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f4f7ff_45%,#ffffff_100%)]" />
      <div className="absolute left-0 top-1/2 h-[380px] w-[55%] -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(25,25,112,0.07),transparent_68%)]" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.28]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={patternId} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#2277FF" strokeOpacity="0.07" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}

function VisionOrbitVisual({ gid }: { gid: string }) {
  return (
    <div className="relative mt-8 flex justify-center lg:mt-10" aria-hidden>
      <div className="relative h-36 w-36 sm:h-40 sm:w-40">
        <div className="absolute inset-0 rounded-full bg-[#2277FF]/15 blur-2xl" />
        <svg viewBox="0 0 160 160" className="relative h-full w-full">
          <defs>
            <linearGradient id={`${gid}-orbit`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2277FF" />
              <stop offset="100%" stopColor="#93c5fd" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r="58" fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="1" />
          <circle cx="80" cy="80" r="38" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="80" cy="22" r="6" fill={`url(#${gid}-orbit)`} />
          <circle cx="132" cy="98" r="5" fill="#93c5fd" opacity="0.9" />
          <circle cx="38" cy="104" r="4" fill="white" opacity="0.75" />
          <path
            d="M80 80 L80 28 M80 80 L126 94 M80 80 L42 100"
            stroke="white"
            strokeOpacity="0.18"
            strokeWidth="1"
          />
          <circle cx="80" cy="80" r="14" fill="white" fillOpacity="0.12" />
        </svg>
        <Compass className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-white/90" />
      </div>
    </div>
  );
}

export function VisionMissionSection() {
  const patternId = useId().replace(/:/g, "");
  const gid = useId().replace(/:/g, "");

  return (
    <section
      id="vision"
      className="relative overflow-hidden py-20 font-sans sm:py-24 lg:py-32"
      aria-labelledby="vision-mission-heading"
    >
      <SectionBackdrop patternId={patternId} />

      <div className="relative mx-auto w-full max-w-[88rem] px-4 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-12 w-full lg:mb-20"
        >
          <div className="flex justify-center sm:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2277FF]/15 bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0056FF] shadow-sm">
              <Target className="h-3.5 w-3.5" aria-hidden />
              Purpose
            </span>
          </div>

          <h2
            id="vision-mission-heading"
            className="mt-6 w-full font-heading font-black uppercase leading-[0.88] tracking-tighter text-slate-900"
          >
            <span className="block w-full text-[clamp(3.25rem,14vw,8.5rem)] sm:text-left">
              Vision
            </span>
            <span className="mt-1 flex w-full items-center justify-between gap-3 sm:mt-0 sm:gap-6">
              <span
                aria-hidden
                className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-[#2277FF]/35 to-[#2277FF]/15 sm:block"
              />
              <span className="shrink-0 text-[clamp(2rem,6vw,4.5rem)] text-[#2277FF]/70">&</span>
              <span
                aria-hidden
                className="hidden h-px flex-1 bg-gradient-to-l from-transparent via-[#191970]/25 to-[#191970]/10 sm:block"
              />
            </span>
            <span className="mt-1 block w-full bg-gradient-to-r from-[#2277FF] via-[#0056FF] to-[#191970] bg-clip-text text-right text-[clamp(3.25rem,14vw,8.5rem)] text-transparent">
              Mission
            </span>
          </h2>

          <p className="mx-auto mt-2 max-w-3xl text-center text-xl leading-relaxed text-slate-800 sm:mt-10 sm:text-left sm:text-lg lg:max-w-2xl lg:text-xl">
            Where we&apos;re headed — and how we help ambitious teams get there with clarity and
            confidence.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10 xl:gap-12">
          {/* Vision — primary dark panel */}
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="relative min-h-[520px] overflow-hidden rounded-[1.75rem] border border-[#2277FF]/20 bg-gradient-to-br from-[#050a1f] via-[#191970] to-[#0d1f6e] p-8 text-white shadow-[0_32px_100px_rgba(25,25,112,0.38)] sm:p-10 lg:min-h-[580px] lg:p-12"
          >
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#2277FF]/25 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
              aria-hidden
            />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <Compass className="h-5 w-5 text-[#93c5fd]" strokeWidth={2} />
                </span>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#93c5fd]">Our vision</p>
              </div>

              <p className="mt-8 font-heading text-[clamp(1.75rem,3.8vw,2.65rem)] font-bold uppercase leading-[1.06] tracking-tight text-white">
                The future of enterprise productivity is intelligent, collaborative, and
                human-centered.
              </p>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                We believe the next generation of B2B operations runs on unified workspaces — where
                automation, governance, and people work together instead of across disconnected
                tools.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {VISION_PILLARS.map((pillar, i) => {
                  const Icon = pillar.icon;
                  return (
                    <motion.div
                      key={pillar.label}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                    >
                      <Icon className="h-4 w-4 text-[#93c5fd]" aria-hidden />
                      <p className="mt-2 text-sm font-bold text-white">{pillar.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">{pillar.description}</p>
                    </motion.div>
                  );
                })}
              </div>

              <VisionOrbitVisual gid={gid} />
            </div>
          </motion.article>

          {/* Mission — light stack */}
          <div className="flex flex-col gap-6">
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="relative flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white p-8 shadow-[0_24px_70px_rgba(25,25,112,0.1)] sm:p-10 lg:min-h-[460px] lg:p-12"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#2277FF] via-[#0056FF] to-[#191970]" aria-hidden />

              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2277FF]/10 ring-1 ring-[#2277FF]/15">
                  <Target className="h-5 w-5 text-[#2277FF]" strokeWidth={2} />
                </span>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0056FF]">Our mission</p>
              </div>

              <h3 className="mt-8 text-[clamp(1.65rem,3vw,2.35rem)] font-bold leading-snug tracking-tight text-slate-900">
                Help teams scale with clarity, speed, and confidence.
              </h3>

              <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
                We remove disconnected tools so teams can run from one source of truth and ship
                decisions faster — without compromising compliance or control.
              </p>

              <ul className="mt-8 space-y-4">
                {MISSION_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-base leading-relaxed text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2277FF]" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>

              <Link
                href="/about"
                className="group mt-auto inline-flex w-fit items-center gap-2 rounded-xl bg-[#050a1f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#191970]"
              >
                Our story
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </motion.article>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.14 }}
              className="grid grid-cols-3 gap-4 rounded-[1.5rem] border border-[#2277FF]/12 bg-[#2277FF]/[0.04] p-5 sm:p-7"
            >
              {PROOF_STATS.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <p className="text-xl font-bold tabular-nums text-[#191970] sm:text-2xl">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium leading-tight text-slate-500 sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Momentum strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className={cn(
            "mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200/80",
            "bg-white/80 px-7 py-6 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center lg:mt-10",
          )}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2277FF]/10">
              <Zap className="h-5 w-5 text-[#2277FF]" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Mission momentum</p>
              <p className="text-sm text-slate-500">
                Built for regulated B2B teams who need speed without losing governance.
              </p>
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2277FF]">
            Intelligent · Collaborative · Human-centered
          </p>
        </motion.div>
      </div>
    </section>
  );
}
