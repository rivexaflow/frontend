"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { Button } from "@/components/ui/button";
import { StatefulButton } from "@/components/ui/stateful-button";

import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

import * as motion from "framer-motion/client";

const Spline = dynamic(() => import("@splinetool/react-spline"), { ssr: false });

/** Published “Share → Viewer / React” URL from Spline (not the editor `app.spline.design/file/...` link). */
const SPLINE_SCENE = "https://prod.spline.design/paGYmJpQ8G2Ybo5x/scene.splinecode";

export function MarketingHero() {
  return (
    <section className="relative min-h-0 flex-1 overflow-hidden bg-slate-950 text-white">
      {/* Full-hero scene: deep navy to midnight gradient for a premium "Royal" feel */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#001a4d] via-slate-950 to-slate-950">
        <div className="flex h-full w-full items-center justify-center">
          <DottedGlowBackground 
            className="opacity-50" 
            color="rgba(0, 86, 255, 0.2)"
            glowColor="rgba(0, 86, 255, 0.8)"
            gap={24}
            radius={1.2}
          />
        </div>
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="pointer-events-none relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-16 pt-12 text-center sm:px-6 sm:pt-16 md:max-w-4xl md:pt-20"
      >
        <div className="pointer-events-auto mb-6 inline-flex overflow-hidden rounded-full border border-white/10 bg-white/[0.05] text-[10px] shadow-[0_0_28px_rgba(34,119,255,0.1)] backdrop-blur-sm sm:text-[11px] md:mb-8 md:text-xs">
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 px-4 py-2 font-semibold text-white">
            NEXT-GEN WORKSPACE
          </span>
          <span className="px-4 py-2 text-white/80">Multi-tenant AI Platform</span>
        </div>

        <h1 className="pointer-events-auto text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
          Meet <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(34,119,255,0.3)]">Rivexaflow</span>
          <span className="mt-4 block text-white/90">Built for secure, AI-ready B2B operations.</span>
        </h1>

        <TextGenerateEffect 
          words="Unify CRM, KYC, invoicing, and AI-powered automation in one workspace. Build trust with role-based access and scale your enterprise operations from day one with intelligent workforce management."
          className="mt-8 max-w-2xl text-sm leading-relaxed text-blue-100 sm:text-base md:mt-10"
        />

        <div className="pointer-events-auto mt-10 flex flex-wrap items-center justify-center gap-4 sm:mt-12">
          <MovingBorderButton
            borderRadius="1.75rem"
            className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800 font-bold"
            containerClassName="h-12 w-48"
            onClick={() => window.location.href = '/login'}
          >
            Start Digital Demo
          </MovingBorderButton>
          <Button 
            variant="outline"
            className="h-12 rounded-full border-white/20 bg-white/5 px-8 text-sm font-bold text-white backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/10 sm:px-10"
            asChild
          >
            <Link href="#vision">How it works</Link>
          </Button>
        </div>

        <div className="pointer-events-auto mt-12 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 sm:mt-16 sm:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6]" />
          Infrastructure active in 4 regions
        </div>
      </motion.div>
    </section>
  );
}
