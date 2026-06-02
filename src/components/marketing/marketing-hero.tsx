"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

import { HeroGlassBrickGrid } from "@/components/marketing/hero-glass-brick-grid";

const HERO_CARDS = [
  {
    image: "/heroimage/heroimage1.jpeg",
    alt: "Team collaboration in Rivexaflow workspace",
    label: "Active workspaces",
    stat: "10k+",
    delta: "+8%",
  },
  {
    image: "/heroimage/heroimage3.jpeg",
    alt: "Governed payments and billing dashboard",
    label: "Secure operations",
    stat: "$3,050",
    delta: "Verified",
    featured: true,
  },
  {
    image: "/heroimage/heroimage5.jpeg",
    alt: "Executive overview and analytics",
    label: "Leadership view",
    stat: "24/7",
    delta: "Live",
  },
] as const;

function HeroPreviewCard({
  card,
  index,
}: {
  card: (typeof HERO_CARDS)[number];
  index: number;
}) {
  const featured = "featured" in card && card.featured;

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.15 + index * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
      className={[
        "relative overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_24px_60px_-20px_rgba(25,25,112,0.45)]",
        featured ? "order-first z-10 sm:order-none md:-mt-10 md:scale-[1.04]" : "md:mt-6",
      ].join(" ")}
    >
      <div
        className={[
          "relative",
          featured ? "h-[200px] sm:h-[220px] md:h-[240px]" : "h-[168px] sm:h-[180px]",
        ].join(" ")}
      >
        <Image
          src={card.image}
          alt={card.alt}
          fill
          className="object-cover"
          sizes={featured ? "(max-width: 768px) 90vw, 360px" : "(max-width: 768px) 42vw, 280px"}
          priority={index === 1}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#191970]/55 via-transparent to-transparent" />
      </div>

      <div className="space-y-2 px-4 py-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {card.label}
          </span>
          <span
            className={[
              "rounded-full px-2 py-0.5 text-[10px] font-bold",
              featured ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700",
            ].join(" ")}
          >
            {card.delta}
          </span>
        </div>
        <p className="text-xl font-bold tracking-tight text-[#191970]">{card.stat}</p>
      </div>
    </motion.article>
  );
}

export function MarketingHero() {
  const [email, setEmail] = useState("");
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.45, 0.7], [1, 1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.7], [0, -48]);

  const signupHref = email.trim()
    ? `/signup?email=${encodeURIComponent(email.trim())}`
    : "/signup";

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] shrink-0 overflow-x-clip bg-white text-[#191970]"
    >
      {/* White top → blue bottom */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white from-0% via-[#f4f8ff] via-[30%] via-[#d4e6ff] via-[52%] via-[#7eb3ff] via-[68%] to-[#2277FF] to-[82%] to-[#1e3a8f] to-100%"
        aria-hidden
      />
      <HeroGlassBrickGrid />
      <div
        className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-white/50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-28 h-80 w-80 rounded-full bg-[#6366f1]/20 blur-3xl"
        aria-hidden
      />

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col items-center px-4 pb-10 pt-[5.5rem] sm:px-6 sm:pt-24"
      >
        <div className="relative z-10 flex w-full max-w-4xl flex-col items-center font-sans">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-4 py-2 text-xs font-semibold text-[#0a1638] shadow-[0_4px_24px_rgba(34,119,255,0.12),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-xl"
          >
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#2277FF]" />
            Enterprise-grade · SOC-ready workspace
          </motion.span>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="max-w-4xl text-center"
          >
            <h1 className="text-[clamp(1.85rem,4.8vw,3.5rem)] font-extrabold leading-[1.15] tracking-[-0.02em] text-[#050a1f] [text-shadow:0_1px_0_rgba(255,255,255,1),0_2px_24px_rgba(255,255,255,0.65)]">
              Make your business operations{" "}
              <span className="text-[#1d4ed8]">fast and secure</span>
              <span className="mt-2 block sm:mt-3 sm:inline sm:pl-2">
                with{" "}
                <span className="inline-flex items-center gap-2 align-middle">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2277FF] to-[#4f46e5] shadow-lg shadow-blue-500/35 ring-2 ring-white/90 sm:h-11 sm:w-11">
                    <span className="font-bold text-lg text-white">R</span>
                  </span>
                  <span className="text-[#050a1f]">Rivexaflow</span>
                </span>
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[clamp(1rem,2vw,1.2rem)] font-medium leading-[1.65] text-[#1e293b] [text-shadow:0_1px_0_rgba(255,255,255,0.9)]">
              One governed platform for CRM, KYC, invoicing, and AI workflows — built for teams that
              need speed without losing audit control.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-8 w-full max-w-xl"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex flex-col gap-2 rounded-2xl border border-white/60 bg-white/50 p-1.5 shadow-[0_12px_40px_-12px_rgba(34,119,255,0.35),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-2xl sm:flex-row sm:items-center sm:rounded-full sm:p-1.5">
              <label htmlFor="hero-email" className="sr-only">
                Work email
              </label>
              <input
                id="hero-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="min-w-0 flex-1 rounded-xl border-0 bg-white/70 px-4 py-3.5 text-sm font-medium text-[#0f172a] placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#2277FF]/30 sm:rounded-full"
              />
              <Link
                href={signupHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#050a1f] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#191970] sm:rounded-full"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-[#334155]"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/50 px-3 py-1 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-[#2277FF]" />
              AI-assisted ops
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/50 px-3 py-1 backdrop-blur-md">
              <TrendingUp className="h-4 w-4 text-[#2277FF]" />
              Multi-tenant ready
            </span>
          </motion.div>
        </div>

        <div className="mt-auto w-full max-w-5xl pt-10 md:pt-14">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5 md:items-end">
            {HERO_CARDS.map((card, index) => (
              <HeroPreviewCard key={card.image} card={card} index={index} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
