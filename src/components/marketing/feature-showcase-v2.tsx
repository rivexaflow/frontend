"use client";

import { useEffect, useRef } from "react";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EnterpriseVisual } from "@/components/marketing/enterprise-visual";
import { LayoutAlt02 } from "@untitledui/icons";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function FeatureShowcaseV2() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const features = [
    {
      title: "We streamline workflows\ninto repeatable wins",
      description:
        "Adaptive automation coordinates approvals, reminders, and escalations in one reliable rhythm for fast-moving teams designed for compliance-heavy environments.",
      accent: "azure" as const,
      stat: "01",
      cardTone: "bg-[#FFFFFF]",
      drift: -8,
    },
    {
      title: "We translate risk controls\ninto smooth operations",
      description:
        "Role-aware access, encrypted data lanes, and policy controls keep regulated workflows efficient and audit-ready for compliance-heavy environments.",
      accent: "midnight" as const,
      stat: "02",
      cardTone: "bg-[#FFFFFF]",
      drift: -2,
    },
    {
      title: "We convert live telemetry\ninto decisive action",
      description:
        "Executive panels combine anomaly watchpoints, trend movement, and team pulse so decisions happen with confidence designed for compliance-heavy environments.",
      accent: "royal" as const,
      stat: "03",
      cardTone: "bg-[#FFFFFF]",
      drift: 2,
    },
    {
      title: "We align teams around\none operating canvas",
      description:
        "Shared pipelines connect operations, finance, and compliance with clear context, ownership, and smoother handoffs designed for compliance-heavy environments.",
      accent: "azure" as const,
      stat: "04",
      cardTone: "bg-[#FFFFFF]",
      drift: 8,
    },
  ];

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const pinEl = pinRef.current;
    const trackEl = trackRef.current;
    if (!sectionEl || !pinEl || !trackEl) return;

    const media = gsap.matchMedia();
    media.add("(min-width: 1024px)", () => {
      const getDistance = () => Math.max(0, trackEl.scrollWidth - pinEl.clientWidth + 64);
      const tween = gsap.to(trackEl, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: sectionEl,
          start: "top top",
          end: () => `+=${getDistance() + window.innerHeight * 0.9}`,
          scrub: 1.1,
          pin: pinEl,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => media.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-0">
      <DottedGlowBackground
        className="opacity-25"
        color="rgba(34, 119, 255, 0.08)"
        glowColor="rgba(0, 86, 255, 0.38)"
        gap={38}
      />

      <div ref={pinRef} className="relative z-10 lg:h-screen lg:overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-24 bg-gradient-to-r from-white to-transparent lg:block" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-24 bg-gradient-to-l from-white to-transparent lg:block" />

        <div ref={trackRef} className="flex gap-5 px-4 pb-5 sm:px-6 lg:h-screen lg:w-max lg:items-center lg:gap-8 lg:px-14">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative flex min-h-[31rem] w-[90vw] max-w-[28rem] shrink-0 flex-col justify-center p-2 lg:min-h-[38rem] lg:w-[32rem] lg:p-0"
          >
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0056FF]">Enterprise Ready</h2>
            <p className="mt-4 font-heading text-4xl font-semibold leading-[0.98] tracking-tight text-[#000000] lg:text-6xl">
              Everything you
              <br />
              need to <span className="text-[#2277FF]">scale</span>
            </p>
            <p className="mt-6 max-w-md text-base leading-relaxed text-slate-600">
              A high-fidelity capability lane designed for ambitious teams, from first workflow automation to global enterprise governance.
            </p>
          </motion.div>

          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto [scrollbar-width:none] lg:overflow-visible [&::-webkit-scrollbar]:hidden">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.08 }}
                className={`group relative flex min-h-[40rem] w-[92vw] max-w-[54rem] shrink-0 snap-start flex-col overflow-hidden rounded-[2.35rem] border border-[#D9E4FF] p-6 shadow-[0_20px_40px_rgba(25,25,112,0.08)] sm:min-h-[42rem] sm:w-[40rem] sm:p-7 lg:min-h-[44rem] lg:w-[46rem] lg:p-8 ${feature.cardTone}`}
              >
                <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 860 560" fill="none" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="rvxWavePrimary" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#E8EEFF" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#191970" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="rvxWaveSoft" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#F4F7FF" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#E8EEFF" stopOpacity="0.75" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M-80 124C60 124 132 54 240 54C360 54 406 146 522 146C664 146 698 84 944 84"
                    stroke="url(#rvxWavePrimary)"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M-90 258C86 258 162 166 288 166C410 166 468 286 614 286C748 286 798 198 946 198"
                    stroke="url(#rvxWaveSoft)"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M-120 386C94 386 192 312 330 312C462 312 530 432 664 432C778 432 836 360 968 360"
                    stroke="url(#rvxWavePrimary)"
                    strokeWidth="1.1"
                  />
                  <path
                    d="M-100 498C130 498 242 438 388 438C542 438 622 528 792 528C892 528 934 492 980 472"
                    stroke="url(#rvxWaveSoft)"
                    strokeWidth="1.05"
                  />
                </svg>

                <div className="relative z-10 h-40 overflow-hidden rounded-[999px] border border-[#D9E4FF] bg-white sm:h-44 lg:h-52">
                  <EnterpriseVisual accent={feature.accent} drift={feature.drift} />
                </div>

                <div className="relative z-10 flex flex-1 flex-col pb-1 pt-9 lg:pt-11">
                  <h3 className="w-full whitespace-pre-line font-heading text-[2.6rem] font-bold leading-[0.96] tracking-tight text-[#191970] sm:text-[2.9rem] lg:text-[4rem]">
                    {feature.title}
                  </h3>
                  <p className="mt-6 w-[80%] text-[1.02rem] leading-relaxed text-[#334155] sm:text-[1.08rem] lg:text-[1.22rem]">
                    {feature.description}
                  </p>
                  <div className="mt-auto pt-4 text-right font-heading text-8xl font-extrabold tracking-tight text-[#2277FF]/24 lg:text-9xl">
                    {feature.stat}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
