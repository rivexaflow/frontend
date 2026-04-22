"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const Spline = dynamic(() => import("@splinetool/react-spline"), { ssr: false });

/** Published “Share → Viewer / React” URL from Spline (not the editor `app.spline.design/file/...` link). */
const SPLINE_SCENE = "https://prod.spline.design/paGYmJpQ8G2Ybo5x/scene.splinecode";

export function MarketingHero() {
  return (
    <section className="relative min-h-0 flex-1 overflow-hidden bg-black text-white">
      {/* Full-hero scene: same framing as Spline (black band + geometry); letterbox on canvas stays on black */}
      <div className="absolute inset-0 z-0 bg-black">
        <div className="flex h-full w-full items-center justify-center">
          <Spline
            scene={SPLINE_SCENE}
            className="h-full w-full [&>canvas]:h-full [&>canvas]:w-full [&>canvas]:object-contain"
          />
        </div>
      </div>

      {/* Copy sits over the scene’s natural top black area — not a separate “panel” above the 3D */}
      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-8 pt-6 text-center sm:px-6 sm:pt-8 md:max-w-4xl md:pt-10">
        <div className="pointer-events-auto mb-5 inline-flex overflow-hidden rounded-full border border-white/12 bg-white/[0.05] text-[10px] shadow-[0_0_28px_rgba(34,119,255,0.12)] backdrop-blur sm:text-[11px] md:mb-6 md:text-xs">
          <span className="bg-gradient-to-r from-[#0056ff] to-[#2277ff] px-3 py-1.5 font-semibold text-white sm:px-3.5">
            Start your workspace
          </span>
          <span className="px-3 py-1.5 text-white/70 sm:px-3.5">Multi-tenant SaaS</span>
        </div>

        <h1 className="pointer-events-auto text-balance text-[1.65rem] font-semibold leading-[1.15] tracking-tight sm:text-3xl md:text-[2.15rem] md:leading-[1.12] lg:text-4xl">
          Meet <span className="bg-gradient-to-r from-[#2277ff] to-[#7eb6ff] bg-clip-text text-transparent">Rivexaflow</span>
          <span className="mt-2 block text-white sm:mt-2.5">Built for secure, AI-ready B2B operations.</span>
        </h1>

        <p className="pointer-events-auto mt-4 max-w-xl text-pretty text-xs leading-relaxed text-white/65 sm:max-w-2xl sm:text-[13px] md:mt-5 md:text-sm">
          Unify CRM, KYC, invoicing, and AI-powered automation in one workspace—live team monitoring, role-based access,
          and enterprise-grade scale from day one.
        </p>

        <div className="pointer-events-auto mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:mt-7 sm:gap-3 md:mt-8">
          <Link
            href="/login"
            className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black shadow-[0_8px_28px_rgba(255,255,255,0.1)] transition hover:bg-white/90 sm:px-6 sm:text-[13px] sm:py-2.5"
          >
            Start demo
          </Link>
          <Link
            href="#vision"
            className="rounded-full border border-white/22 bg-white/[0.03] px-5 py-2 text-xs font-semibold text-white backdrop-blur transition hover:border-white/35 hover:bg-white/[0.07] sm:px-6 sm:text-[13px] sm:py-2.5"
          >
            Learn more
          </Link>
        </div>

        <div className="pointer-events-auto mt-5 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.28em] text-white/30 sm:mt-6 sm:text-[10px] sm:tracking-[0.32em]">
          <span className="h-1 w-1 shrink-0 rounded-full bg-[#2277ff] shadow-[0_0_8px_#2277ff]" />
          Live workspace hub
        </div>
      </div>
    </section>
  );
}
