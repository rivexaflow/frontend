"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

const DEFAULT_LOOP_DISTANCE_PX = 864;

const IMAGES = [
  "/Ctaimage/ctaIMG10.jpeg",
  "/Ctaimage/ctaIMG11.jpeg",
  "/Ctaimage/ctaIMG12.jpeg",
  "/Ctaimage/ctaIMG13.jpeg",
  "/Ctaimage/ctaIMG14.jpeg",
  "/Ctaimage/ctaIMG6.jpeg",
];

const albumColumns: Array<{ direction: "up" | "down"; images: string[] }> = [
  { direction: "up", images: IMAGES.slice(0, 4) },
  { direction: "down", images: IMAGES.slice(1, 5) },
  { direction: "up", images: IMAGES.slice(2, 6) },
  { direction: "down", images: IMAGES.slice(0, 4) },
  { direction: "up", images: IMAGES.slice(1, 5) },
];

function CTAButton({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full bg-[#2277FF] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(34,119,255,0.4)] transition hover:bg-[#0056FF]">
      {children}
    </span>
  );
}

export function CTASection() {
  const columnRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [loopDistances, setLoopDistances] = useState<number[]>([]);

  return (
    <section className="relative mb-0 mt-14 ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen overflow-hidden bg-[#020205] px-6 py-8 text-white md:px-10 md:py-8">
      <DottedGlowBackground
        className="opacity-20"
        color="rgba(227,231,252,0.18)"
        glowColor="rgba(34,119,255,0.35)"
        gap={24}
        radius={1.1}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_320px_at_20%_0%,rgba(34,119,255,0.28),transparent_60%),radial-gradient(800px_300px_at_85%_15%,rgba(25,25,112,0.3),transparent_60%)]" />

      <div className="relative mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-8 md:grid-cols-[1fr_1fr] md:items-stretch">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#E3E7FC]">Early Access</span>
          <h3 className="font-heading text-[clamp(2.6rem,5vw,5rem)] font-extrabold leading-[1.02]">
            Your Transactions Deserve Better
            <br />
            Infrastructure
          </h3>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/70">
            Join the early access program. We&apos;re onboarding select banks, NBFCs, and payment
            aggregators to pilot the full Rivexaflow suite.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex">
              <CTAButton>Request for Early Access</CTAButton>
            </Link>
          </div>
        </div>

        <div className="relative -my-8 -mr-6 h-[340px] overflow-hidden md:-mr-10 md:h-auto md:min-h-[380px]">
          <div className="absolute inset-0 [perspective:1000px]">
            <div className="absolute -right-64 top-1/2 -translate-y-1/2 grid w-[195%] grid-cols-5 gap-1 [transform:rotateX(45deg)_rotateY(20deg)_rotate(-25deg)_translate3d(-2em,7.2em,8em)] [transform-style:preserve-3d] [mask-image:linear-gradient(transparent_0%,rgba(0,0,0,0.03)_4%,rgba(0,0,0,0.18)_10%,rgba(0,0,0,0.42)_18%,#000_28%)]">
              {albumColumns.map((col, colIdx) => (
                <div
                  key={`${col.direction}-${colIdx}`}
                  ref={(el) => {
                    columnRefs.current[colIdx] = el;
                  }}
                  className={[
                    "mx-[2px] flex w-[270px] flex-col gap-1 will-change-transform [backface-visibility:hidden]",
                    colIdx === 0 || colIdx === 3 ? "pt-20" : "",
                    colIdx === 1 || colIdx === 4 ? "pt-10" : "",
                  ].join(" ")}
                  style={{
                    animation:
                      col.direction === "up"
                        ? "imageScrollingUp 16s linear infinite"
                        : "imageScrollingDown 16s linear infinite",
                    animationPlayState: "running",
                    ["--loop-distance" as string]: `${loopDistances[colIdx] ?? DEFAULT_LOOP_DISTANCE_PX}px`,
                  }}
                >
                  {[...col.images, ...col.images].map((img, imgIdx) => (
                    <img
                      key={`${img}-${imgIdx}`}
                      src={img}
                      alt="Automation module visual"
                      className="block h-[200px] w-[280px] rounded-sm object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        const target = event.currentTarget;
                        if (target.src.includes("/Ctaimage/ctaIMG.jpeg")) return;
                        target.src = "/Ctaimage/ctaIMG.jpeg";
                      }}
                      onLoad={() => {
                        const el = columnRefs.current[colIdx];
                        if (!el) return;
                        const measured = Math.max(1, Math.round(el.scrollHeight / 2));
                        setLoopDistances((prev) => {
                          if ((prev[colIdx] ?? DEFAULT_LOOP_DISTANCE_PX) === measured) return prev;
                          const next = [...prev];
                          next[colIdx] = measured || DEFAULT_LOOP_DISTANCE_PX;
                          return next;
                        });
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes imageScrollingUp {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(0, calc(-1 * var(--loop-distance, 864px)), 0);
          }
        }
        @keyframes imageScrollingDown {
          0% {
            transform: translate3d(0, calc(-1 * var(--loop-distance, 864px)), 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </section>
  );
}
