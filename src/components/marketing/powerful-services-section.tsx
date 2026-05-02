"use client";

import { motion, useInView } from "framer-motion";
import { useId, useRef } from "react";

import { ServicesFlyingGallery } from "@/components/marketing/services-flying-gallery";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { cn } from "@/lib/utils";

const RIBBON_PATH =
  "M28 72 C298 688 582 916 892 582 C1098 348 1268 512 1576 1128";

const CTA_SURFACE = "#020205";

function ServicesThreadBackdrop({ id, isDark }: { id: string; isDark: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <svg
        className="absolute -left-[14%] top-[-8%] h-[118%] w-[132%]"
        viewBox="0 0 1600 1200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`${id}-ribbon-a`} x1="14%" y1="4%" x2="86%" y2="96%">
            <stop offset="0%" stopColor="#2277FF" stopOpacity={isDark ? 0.45 : 0.34} />
            <stop offset="48%" stopColor="#4048b4" stopOpacity={isDark ? 0.38 : 0.28} />
            <stop offset="100%" stopColor="#191970" stopOpacity={isDark ? 0.42 : 0.3} />
          </linearGradient>
          <linearGradient id={`${id}-ribbon-b`} x1="38%" y1="16%" x2="62%" y2="88%">
            <stop offset="0%" stopColor="#6b93ff" stopOpacity={isDark ? 0.28 : 0.18} />
            <stop offset="55%" stopColor="#4f4aae" stopOpacity={isDark ? 0.24 : 0.16} />
            <stop offset="100%" stopColor="#252a72" stopOpacity={isDark ? 0.32 : 0.2} />
          </linearGradient>
        </defs>
        <path
          d={RIBBON_PATH}
          fill="none"
          stroke={`url(#${id}-ribbon-a)`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={116}
          className={cn("transition-opacity duration-500", isDark ? "opacity-[0.62]" : "opacity-[0.52]")}
        />
        <path
          d={RIBBON_PATH}
          fill="none"
          stroke={`url(#${id}-ribbon-b)`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={58}
          className={cn("transition-opacity duration-500", isDark ? "opacity-[0.52]" : "opacity-[0.42]")}
        />
      </svg>
      <div
        className={cn(
          "absolute -left-[18%] top-[-14%] h-[72%] w-[72%] rounded-full transition-opacity duration-500",
          isDark
            ? "bg-[radial-gradient(ellipse_at_center,rgba(34,119,255,0.22),transparent_68%)] opacity-100"
            : "bg-[radial-gradient(ellipse_at_center,rgba(34,119,255,0.11),transparent_68%)] opacity-100",
        )}
      />
      <div
        className={cn(
          "absolute bottom-[-8%] right-[-14%] h-[58%] w-[58%] rounded-full transition-opacity duration-500",
          isDark
            ? "bg-[radial-gradient(ellipse_at_center,rgba(25,25,112,0.28),transparent_70%)]"
            : "bg-[radial-gradient(ellipse_at_center,rgba(25,25,112,0.09),transparent_70%)]",
        )}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-white via-white/82 to-white"
        initial={false}
        animate={{ opacity: isDark ? 0 : 1 }}
        transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-[#020205]/90 via-[#050818]/42 to-[#020205]/95"
        initial={false}
        animate={{ opacity: isDark ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      />
    </div>
  );
}

export function PowerfulServicesSection() {
  const uid = useId().replace(/:/g, "");
  const sectionRef = useRef<HTMLElement | null>(null);

  const inView = useInView(sectionRef, {
    amount: 0.32,
    margin: "0px 0px -12% 0px",
    once: false,
  });

  return (
    <motion.section
      ref={sectionRef}
      id="services"
      className="relative isolate overflow-hidden py-10 sm:py-14"
      initial={false}
      animate={{
        backgroundColor: inView ? CTA_SURFACE : "#ffffff",
      }}
      transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <ServicesThreadBackdrop id={uid} isDark={inView} />

      <motion.div
        className="pointer-events-none absolute inset-0 z-[1]"
        initial={false}
        animate={{ opacity: inView ? 1 : 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        aria-hidden
      >
        <DottedGlowBackground
          className="opacity-100"
          color="rgba(227,231,252,0.18)"
          glowColor="rgba(34,119,255,0.35)"
          gap={24}
          radius={1.1}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 320px at 20% 0%, rgba(34,119,255,0.28), transparent 60%), radial-gradient(800px 300px at 85% 15%, rgba(25,25,112,0.3), transparent 60%)",
          }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
          className="mx-auto mb-8 max-w-3xl text-center sm:mb-10"
        >
          <motion.p
            className="font-subheading text-[11px] font-bold uppercase tracking-[0.28em] sm:text-xs"
            animate={{ color: inView ? "#E3E7FC" : "#2277FF" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            Powerful Services
          </motion.p>
          <h2 className="mt-3 font-heading text-[clamp(1.85rem,4.5vw,3.15rem)] font-black leading-[1.08] tracking-tight">
            <motion.span
              animate={{ color: inView ? "#ffffff" : "#191970" }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              One platform,{" "}
            </motion.span>
            <span
              className={cn(
                "bg-clip-text text-transparent bg-gradient-to-r transition-[background-image] duration-500",
                inView
                  ? "from-[#93c5fd] via-[#bfdbfe] to-[#E3E7FC]"
                  : "from-[hsl(var(--rvx-azure))] to-[hsl(var(--rvx-royal))]",
              )}
            >
              endless capabilities
            </span>
          </h2>
          <motion.p
            className="mt-4 text-pretty text-base leading-relaxed sm:text-lg"
            animate={{ color: inView ? "rgba(255,255,255,0.72)" : "rgba(25,25,112,0.75)" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            Run CRM, verification, invoicing, and AI workflows together — clearer handoffs, faster execution.
          </motion.p>
        </motion.header>

        <ServicesFlyingGallery />
      </div>
    </motion.section>
  );
}
