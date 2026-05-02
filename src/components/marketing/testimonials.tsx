"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    quote:
      "Rivexaflow gave us a clear operating rhythm across compliance, CRM, and invoicing. We now onboard customers faster without losing audit clarity.",
    name: "Sarah Chen",
    title: "CEO, TechStart Solutions",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
  },
  {
    quote:
      "The workflow automation quality is exceptional. Rivexaflow reduced manual handoffs and helped our teams move from reactive to proactive operations.",
    name: "Michael Rodriguez",
    title: "Operations Director, FinEdge",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  },
  {
    quote:
      "We replaced five disconnected tools with Rivexaflow and immediately improved cross-team visibility. Leadership reporting is now real-time and reliable.",
    name: "Emily Watson",
    title: "Founder, NovaAssist",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=240&q=80",
  },
  {
    quote:
      "Security and compliance are now first-class in our day-to-day process. Our operations team has cut repetitive checks while maintaining strict standards.",
    name: "David Park",
    title: "CTO, GlobalLogistics",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=240&q=80",
  },
  {
    quote:
      "Implementation was smooth, support was responsive, and adoption was fast. Rivexaflow feels like infrastructure built for modern enterprise teams.",
    name: "James Wilson",
    title: "VP Operations, ScaleUp Inc",
    avatar:
      "https://images.unsplash.com/photo-1542204625-de293a3b7085?auto=format&fit=crop&w=240&q=80",
  },
  {
    quote:
      "The dashboarding layer gives us immediate confidence in pipeline health and financial throughput. Our weekly planning is now data-driven, not guesswork.",
    name: "Priya Menon",
    title: "Head of Revenue Operations, ApexBridge",
    avatar:
      "https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=240&q=80",
  },
  {
    quote:
      "We needed enterprise-grade controls without slowing execution. Rivexaflow delivered structured governance with a clean and highly usable experience.",
    name: "Noah Bennett",
    title: "Product Lead, TridentWorks",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80",
  },
] as const;

const ROTATE_MS = 5200;

function StarRow() {
  return (
    <div className="flex gap-0.5 text-amber-400" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 20 20" aria-hidden>
          <title>★</title>
          <path d="M10 2l2.47 6.94h7.05l-5.71 4.41 2.18 7.04L10 16.74l-5.99 3.65 2.18-7.04-5.71-4.41h7.05L10 2z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = TESTIMONIALS.length;

  const current = TESTIMONIALS[active]!;

  const go = useCallback(
    (dir: -1 | 1) => {
      setActive((i) => (i + dir + n) % n);
    },
    [n],
  );

  useEffect(() => {
    if (paused || n < 2) return;
    const t = window.setInterval(() => {
      setActive((i) => (i + 1) % n);
    }, ROTATE_MS);
    return () => window.clearInterval(t);
  }, [paused, n]);

  return (
    <section
      id="testimonial-area"
      className="relative overflow-hidden bg-gradient-to-b from-[#f8fbff] via-white to-[#f8fbff] py-16 sm:py-20 lg:py-24 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden>
        <div className="absolute left-[-20%] top-[10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(34,119,255,0.11),transparent_68%)]" />
        <div className="absolute bottom-[-8%] right-[-14%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle_at_center,rgba(25,25,112,0.08),transparent_70%)]" />
      </div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[6%] top-[18%] text-[clamp(8rem,24vw,16rem)] font-serif font-bold leading-none text-[#2277FF]/[0.06]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <Quote className="h-[1em] w-[1em] rotate-180" strokeWidth={1.2} />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <p className="font-subheading text-[11px] font-bold uppercase tracking-[0.26em] text-[#2277FF] dark:text-[#93c5fd]">
            Trusted outcomes
          </p>
          <h2 className="mt-3 font-heading text-[clamp(1.85rem,4.2vw,3rem)] font-black uppercase leading-[1.05] tracking-tight text-[#191970] dark:text-white">
            A word from our customers
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#191970]/74 dark:text-slate-400 sm:text-[1.05rem]">
            Teams adopting Rivexaflow cite faster onboarding, sharper visibility across CRM and finance, and governed
            execution they can defend in audit.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto mt-12 max-w-4xl"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.06 }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative rounded-[1.85rem] border border-[#E3E7FC] bg-white/92 p-[1px] shadow-[0_28px_80px_rgba(25,25,112,0.1),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/85 dark:shadow-none">
            <div className="rounded-[calc(1.85rem-1px)] bg-gradient-to-br from-[#2277FF]/[0.05] via-white to-transparent p-[1px] dark:via-slate-900">
              <div className="relative overflow-hidden rounded-[calc(1.85rem-2px)] bg-white px-6 py-9 sm:px-10 sm:py-11 dark:bg-slate-950/92">
                <div className="pointer-events-none absolute right-8 top-8 text-[#2277FF]/10 dark:text-[#2277FF]/18">
                  <Quote className="h-24 w-24 sm:h-28 sm:w-28" strokeWidth={1} />
                </div>

                <div className="relative flex flex-col gap-8 md:flex-row md:items-start md:gap-10 lg:gap-12">
                  <div className="flex shrink-0 justify-center md:justify-start">
                    <div className="relative">
                      <motion.div
                        className="absolute -inset-[3px] rounded-full bg-gradient-to-br from-[#2277FF] via-[#5b7cff] to-[#191970] opacity-90"
                        layoutId="avatar-ring"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                      <div className="relative h-[108px] w-[108px] overflow-hidden rounded-full ring-4 ring-white dark:ring-slate-950 sm:h-[126px] sm:w-[126px]">
                        <img
                          src={current.avatar}
                          alt=""
                          aria-hidden
                          width={252}
                          height={252}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 pt-1 text-left">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <StarRow />
                      <span className="rounded-full bg-[#2277FF]/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#2277FF] dark:bg-[#2277FF]/20 dark:text-[#93c5fd]">
                        Verified partner
                      </span>
                    </div>

                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={active}
                        initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                        transition={{ duration: 0.38, ease: [0.22, 0.61, 0.36, 1] }}
                      >
                        <blockquote>
                          <p className="text-[clamp(1.05rem,calc(0.92rem+0.65vw),1.35rem)] font-medium leading-relaxed tracking-tight text-[#191970]/92 dark:text-slate-100">
                            {current.quote}
                          </p>
                        </blockquote>
                        <footer className="mt-8 border-t border-[#E3E7FC]/90 pt-6 dark:border-slate-800">
                          <cite className="font-heading text-lg font-bold not-italic text-[#191970] dark:text-white">
                            {current.name}
                          </cite>
                          <p className="mt-1 text-sm font-medium uppercase tracking-[0.12em] text-[#2277FF]/90 dark:text-[#93c5fd]">
                            {current.title}
                          </p>
                        </footer>
                      </motion.div>
                    </AnimatePresence>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => go(-1)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E3E7FC] bg-white text-[#191970] shadow-sm transition hover:border-[#2277FF]/40 hover:bg-[#f8fbff] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-[#2277FF]/50"
                        aria-label="Previous testimonial"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => go(1)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E3E7FC] bg-white text-[#191970] shadow-sm transition hover:border-[#2277FF]/40 hover:bg-[#f8fbff] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-[#2277FF]/50"
                        aria-label="Next testimonial"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <span className="ml-auto hidden text-xs text-[#191970]/45 dark:text-slate-500 sm:inline">
                        {active + 1} / {n}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-9 flex flex-wrap items-center justify-center gap-3 sm:gap-3"
          role="tablist"
          aria-label="Select testimonial"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {TESTIMONIALS.map((item, idx) => {
            const isOn = idx === active;
            return (
              <button
                key={item.name}
                type="button"
                role="tab"
                aria-selected={isOn}
                onClick={() => setActive(idx)}
                className={cn(
                  "group relative shrink-0 overflow-hidden rounded-full p-[3px] transition-transform duration-200",
                  isOn ? "scale-105 ring-4 ring-[#2277FF]/25" : "opacity-72 hover:scale-[1.04] hover:opacity-100",
                )}
              >
                <span
                  className={cn(
                    "block rounded-full bg-gradient-to-br",
                    isOn ? "from-[#2277FF] via-[#4f6dff] to-[#191970] p-[2px]" : "from-transparent via-transparent to-transparent p-px",
                  )}
                >
                  <span className={cn(
                    "block overflow-hidden rounded-full bg-white ring-2 dark:bg-slate-950",
                    isOn ? "ring-white dark:ring-slate-900" : "ring-[#E3E7FC] dark:ring-slate-700",
                  )}>
                    <img
                      src={item.avatar}
                      alt=""
                      width={112}
                      height={112}
                      className={cn(
                        "h-11 w-11 object-cover sm:h-12 sm:w-12",
                        !isOn && "grayscale-[35%]",
                      )}
                      loading="lazy"
                    />
                  </span>
                </span>
                <span className="sr-only">
                  {item.name}, {item.title}
                </span>
              </button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
