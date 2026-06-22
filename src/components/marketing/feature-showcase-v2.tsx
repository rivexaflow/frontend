"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, GitBranch, LayoutGrid, LineChart, ShieldCheck, type LucideIcon } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/utils";

type Accent = "azure" | "royal" | "midnight";

type Feature = {
  title: string;
  description: string;
  accent: Accent;
  stat: string;
  icon: LucideIcon;
  span: "hero" | "compact" | "wide";
  variant: "light" | "dark" | "glass";
};

const FEATURES: Feature[] = [
  {
    title: "Streamline workflows into repeatable wins",
    description:
      "Adaptive automation coordinates approvals, reminders, and escalations in one reliable rhythm for fast-moving teams designed for compliance-heavy environments.",
    accent: "azure",
    stat: "01",
    icon: GitBranch,
    span: "hero",
    variant: "light",
  },
  {
    title: "Translate risk controls into smooth operations",
    description:
      "Role-aware access, encrypted data lanes, and policy controls keep regulated workflows efficient and audit-ready for compliance-heavy environments.",
    accent: "midnight",
    stat: "02",
    icon: ShieldCheck,
    span: "compact",
    variant: "dark",
  },
  {
    title: "Convert live telemetry into decisive action",
    description:
      "Executive panels combine anomaly watchpoints, trend movement, and team pulse so decisions happen with confidence designed for compliance-heavy environments.",
    accent: "royal",
    stat: "03",
    icon: LineChart,
    span: "compact",
    variant: "glass",
  },
  {
    title: "Align teams around one operating canvas",
    description:
      "Shared pipelines connect operations, finance, and compliance with clear context, ownership, and smoother handoffs designed for compliance-heavy environments.",
    accent: "azure",
    stat: "04",
    icon: LayoutGrid,
    span: "wide",
    variant: "light",
  },
];

const SPAN_CLASS: Record<Feature["span"], string> = {
  hero: "sm:col-span-2",
  compact: "sm:col-span-1",
  wide: "sm:col-span-2",
};

function SectionBackdrop({ patternId }: { patternId: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-[20%] top-[-30%] h-[70%] w-[55%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,119,255,0.12),transparent_68%)]" />
      <div className="absolute -right-[15%] bottom-[-20%] h-[60%] w-[50%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(25,25,112,0.08),transparent_70%)]" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.35]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={patternId} width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#2277FF" fillOpacity="0.18" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-[#f4f7ff]" />
    </div>
  );
}

function WorkflowMiniMock({ gid }: { gid: string }) {
  return (
    <div className="relative mt-auto flex justify-end pt-6" aria-hidden>
      <div className="relative w-full max-w-[280px] rounded-2xl border border-[#2277FF]/12 bg-gradient-to-br from-white to-[#eef3ff] p-4 shadow-[0_20px_50px_rgba(25,25,112,0.08)]">
        <div className="mb-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <span>Workflow lane</span>
          <span className="text-emerald-600">Live</span>
        </div>
        <svg viewBox="0 0 240 88" className="h-auto w-full">
          <defs>
            <linearGradient id={`${gid}-flow`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2277FF" />
              <stop offset="100%" stopColor="#191970" />
            </linearGradient>
          </defs>
          {[16, 44, 72].map((y, i) => (
            <g key={y}>
              <rect x="12" y={y} width="72" height="10" rx="5" fill="#e8eeff" />
              <rect x="12" y={y} width={48 + i * 12} height="10" rx="5" fill={`url(#${gid}-flow)`} opacity={0.85 - i * 0.15} />
              <circle cx="198" cy={y + 5} r="5" fill={i === 2 ? "#10b981" : "#2277FF"} opacity={0.9} />
              <path d={`M92 ${y + 5} H186`} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function ShieldMiniMock() {
  return (
    <div className="relative mt-auto pt-5" aria-hidden>
      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
        <ShieldCheck className="h-12 w-12 text-[#93c5fd]" strokeWidth={1.5} />
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {["RBAC", "Audit", "Encrypt"].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/80"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChartMiniMock({ gid }: { gid: string }) {
  const bars = [0.42, 0.68, 0.55, 0.82, 0.64, 0.9];
  return (
    <div className="relative mt-auto pt-5" aria-hidden>
      <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Signal pulse</p>
            <p className="text-lg font-bold tabular-nums text-[#191970]">+24.8%</p>
          </div>
          <span className="rounded-md bg-[#0056FF]/10 px-2 py-0.5 text-[10px] font-bold text-[#0056FF]">7d</span>
        </div>
        <svg viewBox="0 0 200 56" className="h-14 w-full">
          <defs>
            <linearGradient id={`${gid}-chart`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0056FF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0056FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 42 L33 34 L66 38 L99 22 L132 28 L165 14 L200 18 L200 56 L0 56 Z"
            fill={`url(#${gid}-chart)`}
          />
          <path
            d="M0 42 L33 34 L66 38 L99 22 L132 28 L165 14 L200 18"
            fill="none"
            stroke="#0056FF"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {bars.map((h, i) => (
            <rect
              key={i}
              x={8 + i * 30}
              y={52 - h * 40}
              width="14"
              height={h * 40}
              rx="3"
              fill="#2277FF"
              opacity={0.15 + i * 0.05}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

function TeamMiniMock() {
  const initials = ["PM", "AK", "SR", "JL", "+8"];
  return (
    <div className="relative mt-auto flex flex-col gap-4 pt-4 sm:flex-row sm:items-end sm:justify-between" aria-hidden>
      <div className="flex -space-x-2">
        {initials.map((label, i) => (
          <span
            key={label}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold shadow-sm",
              i === initials.length - 1
                ? "bg-[#191970] text-white"
                : "bg-gradient-to-br from-[#2277FF] to-[#191970] text-white",
            )}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-3 gap-1.5 sm:max-w-[200px]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-8 rounded-lg border border-[#2277FF]/10",
              i % 3 === 0 ? "bg-[#2277FF]/15" : "bg-white/80",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function FeatureCard({
  feature,
  index,
  gid,
}: {
  feature: Feature;
  index: number;
  gid: string;
}) {
  const Icon = feature.icon;
  const isDark = feature.variant === "dark";
  const isGlass = feature.variant === "glass";
  const isWide = feature.span === "wide";

  const Mock =
    feature.stat === "01"
      ? () => <WorkflowMiniMock gid={gid} />
      : feature.stat === "02"
        ? ShieldMiniMock
        : feature.stat === "03"
          ? () => <ChartMiniMock gid={gid} />
          : TeamMiniMock;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex min-h-[280px] flex-col overflow-hidden rounded-[1.35rem] p-6 sm:min-h-[300px] sm:p-7",
        SPAN_CLASS[feature.span],
        isDark &&
          "bg-gradient-to-br from-[#191970] via-[#12124a] to-[#0a0a2e] text-white shadow-[0_24px_60px_rgba(25,25,112,0.28)]",
        isGlass &&
          "border border-white/70 bg-white/55 shadow-[0_16px_48px_rgba(34,119,255,0.08)] backdrop-blur-md",
        !isDark &&
          !isGlass &&
          "border border-slate-200/80 bg-white shadow-[0_16px_48px_rgba(25,25,112,0.06)]",
        isWide && "lg:flex-row lg:gap-8 lg:p-8",
      )}
    >
      {!isDark ? (
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#2277FF]/8 blur-2xl transition-opacity group-hover:opacity-100"
          aria-hidden
        />
      ) : null}

      <div className={cn("relative z-10 flex flex-1 flex-col", isWide && "lg:max-w-[52%]")}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
                isDark
                  ? "bg-white/10 ring-white/15"
                  : isGlass
                    ? "bg-[#0056FF]/10 ring-[#0056FF]/15"
                    : "bg-[#2277FF]/10 ring-[#2277FF]/15",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isDark ? "text-[#93c5fd]" : isGlass ? "text-[#0056FF]" : "text-[#2277FF]",
                )}
                strokeWidth={2}
              />
            </span>
            <span
              className={cn(
                "text-xs font-bold tabular-nums tracking-widest",
                isDark ? "text-white/40" : "text-slate-300",
              )}
            >
              {feature.stat}
            </span>
          </div>
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full opacity-0 transition-all group-hover:opacity-100",
              isDark ? "bg-white/10 text-white" : "bg-slate-100 text-slate-500",
            )}
          >
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <h3
          className={cn(
            "mt-5 text-xl font-bold leading-snug tracking-tight sm:text-[1.35rem]",
            isDark ? "text-white" : "text-slate-900",
          )}
        >
          {feature.title}
        </h3>
        <p
          className={cn(
            "mt-3 text-[0.9375rem] leading-relaxed",
            isDark ? "text-slate-300" : "text-slate-600",
            !isWide && "max-w-md",
          )}
        >
          {feature.description}
        </p>

        {!isWide ? <Mock /> : null}
      </div>

      {isWide ? (
        <div className="relative z-10 mt-6 flex flex-1 items-end lg:mt-0">
          <Mock />
        </div>
      ) : null}
    </motion.article>
  );
}

export function FeatureShowcaseV2() {
  const patternId = useId().replace(/:/g, "");
  const gid = useId().replace(/:/g, "");

  return (
    <section
      className="relative overflow-hidden bg-[#f4f7ff] py-16 font-sans sm:py-20 lg:py-28"
      aria-labelledby="enterprise-ready-heading"
    >
      <SectionBackdrop patternId={patternId} />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-10 xl:gap-14">
          {/* Left headline rail */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-28 lg:col-span-4 xl:col-span-4"
          >
            <div className="relative">
              <div
                className="absolute -left-3 top-2 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-[#2277FF] via-[#2277FF]/30 to-transparent lg:block"
                aria-hidden
              />

              <span className="inline-flex items-center gap-2 rounded-full border border-[#2277FF]/20 bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0056FF] shadow-sm backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2277FF]" aria-hidden />
                Enterprise ready
              </span>

              <h2
                id="enterprise-ready-heading"
                className="mt-6 font-heading text-[clamp(2.35rem,5vw,3.75rem)] font-bold uppercase leading-[0.98] tracking-tight text-slate-900"
              >
                Everything you need to{" "}
                <span className="bg-gradient-to-r from-[#2277FF] to-[#191970] bg-clip-text text-transparent">
                  scale
                </span>
              </h2>

              <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600 sm:text-[1.0625rem]">
                A high-fidelity capability lane designed for ambitious teams — from first workflow
                automation to global enterprise governance.
              </p>

              <ol className="mt-8 hidden space-y-3 lg:block">
                {FEATURES.map((f) => (
                  <li
                    key={f.stat}
                    className="flex items-center gap-3 text-sm font-medium text-slate-500"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-[#2277FF] shadow-sm ring-1 ring-slate-200/80">
                      {f.stat}
                    </span>
                    <span className="line-clamp-1">{f.title}</span>
                  </li>
                ))}
              </ol>
            </div>
          </motion.aside>

          {/* Bento grid */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:col-span-8 lg:mt-0 xl:col-span-8">
            {FEATURES.map((feature, index) => (
              <FeatureCard key={feature.stat} feature={feature} index={index} gid={gid} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
