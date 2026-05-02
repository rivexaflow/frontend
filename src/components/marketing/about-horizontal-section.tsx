"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useId, useRef } from "react";

import { MovingBorder } from "@/components/ui/moving-border";
import { cn } from "@/lib/utils";

/** Same ribbon geometry as hero thread — reads as brand-continuous when scaled behind card copy. */
const RIBBON_PATH =
  "M28 72 C298 688 582 916 892 582 C1098 348 1268 512 1576 1128";

function AboutRibbonBackdrop({ gradId }: { gradId: string }) {
  return (
    <div
      className="pointer-events-none absolute -bottom-[26%] -left-[20%] h-[148%] w-[138%]"
      aria-hidden
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1600 1200"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`${gradId}-body`} x1="16%" y1="92%" x2="84%" y2="10%">
            <stop offset="0%" stopColor="#2277FF" stopOpacity={0.38} />
            <stop offset="44%" stopColor="#3d4aaf" stopOpacity={0.34} />
            <stop offset="100%" stopColor="#191970" stopOpacity={0.42} />
          </linearGradient>
          <linearGradient id={`${gradId}-mist`} x1="38%" y1="18%" x2="62%" y2="88%">
            <stop offset="0%" stopColor="#5b8dff" stopOpacity={0.22} />
            <stop offset="55%" stopColor="#5c53c4" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#1e2560" stopOpacity={0.24} />
          </linearGradient>
          <linearGradient id={`${gradId}-edge`} x1="0%" y1="40%" x2="100%" y2="62%">
            <stop offset="0%" stopColor="#E3E7FC" stopOpacity={0} />
            <stop offset="50%" stopColor="#ffffff" stopOpacity={0.32} />
            <stop offset="100%" stopColor="#E3E7FC" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path
          d={RIBBON_PATH}
          fill="none"
          stroke={`url(#${gradId}-body)`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={112}
          opacity={0.55}
        />
        <path
          d={RIBBON_PATH}
          fill="none"
          stroke={`url(#${gradId}-mist)`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={58}
          opacity={0.5}
        />
        <path
          d={RIBBON_PATH}
          fill="none"
          stroke={`url(#${gradId}-edge)`}
          strokeLinecap="round"
          strokeWidth={14}
          opacity={0.45}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* Tiny specular sparkle field — evokes reference “stardust” without heavy filters */}
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.14]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.9) 0.65px, transparent 0.7px)",
          backgroundSize: "14px 16px",
        }}
      />
    </div>
  );
}

export function AboutHorizontalSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const svgBaseId = useId().replace(/:/g, "");

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const titleX = useTransform(scrollYProgress, [0, 1], ["14%", "-68%"]);
  const titleX2 = useTransform(scrollYProgress, [0, 1], ["4%", "-58%"]);
  const panelY = useTransform(scrollYProgress, [0, 1], [64, -18]);

  const cards = [
    {
      tag: "Who We Are",
      title: "Building the operating system for modern enterprise execution.",
      body: "Rivexaflow unifies CRM, KYC, invoicing, workflow automation, and reporting into one secure workspace.",
      tone: "bg-[#f8fbff]",
      scrimStrong: true,
    },
    {
      tag: "Mission",
      title: "Help teams scale with clarity, speed, and confidence.",
      body: "We remove disconnected tools so teams can run from one source of truth and ship decisions faster.",
      tone: "bg-white",
      scrimStrong: false,
    },
    {
      tag: "Security",
      title: "Enterprise controls built in from day one.",
      body: "Role-based access, audit visibility, and workflow governance keep compliance strong as operations grow.",
      tone: "bg-white",
      scrimStrong: false,
    },
    {
      tag: "Automation",
      title: "AI-assisted execution across daily operations.",
      body: "From follow-ups to verification and invoicing, repetitive work becomes automated and measurable.",
      tone: "bg-[#f8fbff]",
      scrimStrong: true,
    },
    {
      tag: "Collaboration",
      title: "Cross-functional teams move as one.",
      body: "Sales, operations, finance, and leadership stay aligned with live insights and shared workflows.",
      tone: "bg-white",
      scrimStrong: false,
    },
    {
      tag: "Impact",
      title: "Operational complexity converted into growth.",
      body: "Customers reduce manual effort, improve turnaround times, and gain real-time business visibility.",
      tone: "bg-[#f8fbff]",
      scrimStrong: true,
    },
  ] as const;

  return (
    <section ref={sectionRef} id="about" className="relative min-h-[175vh] bg-white">
      <div className="sticky top-16 overflow-hidden border-y border-[#E3E7FC] bg-white/96 py-10 backdrop-blur-sm">
        <motion.h2
          style={{ x: titleX }}
          className="font-heading whitespace-nowrap text-[clamp(3.4rem,13vw,13rem)] font-black uppercase tracking-[-0.055em] text-[#191970]"
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
        className="mx-auto mt-12 grid max-w-7xl gap-6 px-6 pb-24 pt-6 md:grid-cols-2 xl:grid-cols-3"
      >
        {cards.map((card, index) => {
          const gradId = `${svgBaseId}-about-${index}`;
          return (
            <div
              key={card.title}
              className="relative rounded-[1.6rem] p-[5px] shadow-[0_18px_45px_rgba(34,119,255,0.14)]"
            >
              {/* Dark base ring so the orb reads as a thick “moving border” */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[#090f2f]"
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
                <MovingBorder duration={4600 + index * 140} rx="26" ry="26">
                  <div className="h-52 w-52 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(34,119,255,1)_0%,rgba(70,92,212,0.62)_42%,rgba(25,25,112,0.22)_74%,transparent_82%)] opacity-[0.95] blur-[1px]" />
                </MovingBorder>
              </div>

              <div
                className={cn(
                  "relative overflow-hidden rounded-[calc(1.6rem-5px)]",
                  card.tone,
                  "ring-1 ring-white/70",
                )}
              >
                <AboutRibbonBackdrop gradId={gradId} />

                {/* Readability veil — ribbon stays decorative */}
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b",
                    card.scrimStrong
                      ? "from-[#f8fbff]/[0.97] via-[#f8fbff]/72 to-[#eef4ff]/[0.92]"
                      : "from-white/[0.96] via-white/68 to-[#f4f8ff]/[0.9]",
                  )}
                  aria-hidden
                />

                <article className="relative z-10 p-7 sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2277FF]">{card.tag}</p>
                  <h3 className="mt-3 font-heading text-[1.9rem] font-black leading-[1.08] text-[#191970]">{card.title}</h3>
                  <p className="mt-4 text-base leading-8 text-[#191970]/82">{card.body}</p>
                </article>
              </div>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}
