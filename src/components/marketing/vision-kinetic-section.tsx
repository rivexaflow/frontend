"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const VISION_TEXT = "THE FUTURE OF ENTERPRISE PRODUCTIVITY IS INTELLIGENT, COLLABORATIVE, AND HUMAN-CENTERED. ";
const BASE_SIZE = 56;
const INFLUENCE_RADIUS = 260;

export function VisionKineticSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const rowsRef = useRef<Array<HTMLDivElement | null>>([]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -8]);
  const rotateZ = useTransform(scrollYProgress, [0, 0.5, 1], [-1.6, 0, 1.6]);

  useEffect(() => {
    const panelEl = panelRef.current;
    const rowEls = rowsRef.current.filter((row): row is HTMLDivElement => Boolean(row));
    if (!panelEl || rowEls.length === 0) return;

    const chars = VISION_TEXT.split("");
    const charStates = chars.map(() => ({
      currentWeight: 360,
      targetWeight: 360,
      currentSize: BASE_SIZE,
      targetSize: BASE_SIZE,
    }));
    const spanGroups: HTMLSpanElement[][] = chars.map(() => []);
    const rowInners: HTMLDivElement[] = [];
    let rowOffsets: number[] = [];
    let singleCopyWidth = 0;
    let scrollProgress = 0;
    const scrollSpeed = 0.6;
    const easing = 0.16;

    rowEls.forEach((row) => {
      row.innerHTML = "";
      const inner = document.createElement("div");
      inner.className = "inline-flex h-full items-center will-change-transform";
      for (let copy = 0; copy < 3; copy += 1) {
        for (let i = 0; i < chars.length; i += 1) {
          const span = document.createElement("span");
          span.textContent = chars[i] === " " ? "\u00a0" : chars[i];
          span.dataset.charIndex = String(i);
          span.style.fontSize = `${BASE_SIZE}px`;
          span.style.fontFamily = "var(--font-heading)";
          span.style.fontWeight = "360";
          span.style.lineHeight = "0.94";
          span.style.display = "inline-block";
          span.style.willChange = "font-size, font-weight";
          spanGroups[i].push(span);
          inner.appendChild(span);
        }
      }
      row.appendChild(inner);
      rowInners.push(inner);
    });

    const calculateOffsets = () => {
      let currentOffset = 0;
      rowOffsets = rowEls.map((row) => {
        const offset = currentOffset;
        currentOffset += row.getBoundingClientRect().width;
        return offset;
      });
      if (rowInners[0]) {
        singleCopyWidth = rowInners[0].scrollWidth / 3;
      }
    };

    const resetTargets = () => {
      charStates.forEach((state) => {
        state.targetWeight = 360;
        state.targetSize = BASE_SIZE;
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      const activeRow = (event.target as HTMLElement | null)?.closest("[data-vision-row]") as HTMLDivElement | null;
      if (!activeRow) {
        resetTargets();
        return;
      }

      resetTargets();
      const spans = activeRow.querySelectorAll<HTMLSpanElement>("span[data-char-index]");
      spans.forEach((span) => {
        const idx = Number(span.dataset.charIndex ?? "-1");
        if (idx < 0 || idx >= charStates.length) return;
        const rect = span.getBoundingClientRect();
        if (rect.right < 0 || rect.left > window.innerWidth) return;
        const centerX = rect.left + rect.width * 0.5;
        const centerY = rect.top + rect.height * 0.5;
        const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
        if (distance >= INFLUENCE_RADIUS) return;

        const intensity = 1 - distance / INFLUENCE_RADIUS;
        const targetWeight = 360 + intensity * 520;
        const targetSize = BASE_SIZE + intensity * 44;
        if (targetWeight > charStates[idx].targetWeight) {
          charStates[idx].targetWeight = targetWeight;
          charStates[idx].targetSize = targetSize;
        }
      });
    };

    calculateOffsets();
    const resizeObserver = new ResizeObserver(calculateOffsets);
    resizeObserver.observe(panelEl);
    rowEls.forEach((row) => resizeObserver.observe(row));
    panelEl.addEventListener("pointermove", handlePointerMove);
    panelEl.addEventListener("pointerleave", resetTargets);
    window.addEventListener("resize", calculateOffsets);

    let rafId = 0;
    const animate = () => {
      if (singleCopyWidth > 0) {
        scrollProgress = (scrollProgress + scrollSpeed) % singleCopyWidth;
      }

      rowInners.forEach((inner, index) => {
        const offset = rowOffsets[index] ?? 0;
        inner.style.transform = `translate3d(${-(offset + scrollProgress)}px,0,0)`;
      });

      for (let i = 0; i < charStates.length; i += 1) {
        const state = charStates[i];
        state.currentWeight += (state.targetWeight - state.currentWeight) * easing;
        state.currentSize += (state.targetSize - state.currentSize) * easing;
        spanGroups[i].forEach((span) => {
          span.style.fontWeight = String(state.currentWeight);
          span.style.fontSize = `${state.currentSize}px`;
        });
      }

      rafId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      panelEl.removeEventListener("pointermove", handlePointerMove);
      panelEl.removeEventListener("pointerleave", resetTargets);
      window.removeEventListener("resize", calculateOffsets);
    };
  }, []);

  return (
    <section id="vision" ref={sectionRef} className="relative overflow-hidden bg-white py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(34,119,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,119,255,0.08)_1px,transparent_1px)] bg-[size:54px_54px] opacity-30" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <h2 className="sr-only">Our Vision - The future of enterprise productivity</h2>

        <div className="pointer-events-none absolute -left-20 -top-28 font-heading text-[clamp(2.1rem,8vw,10rem)] font-black uppercase leading-none tracking-tight text-[#0056FF]/50">
          Strategic
          <br />
          Vision
        </div>
        <div className="pointer-events-none absolute -bottom-28 -right-20 text-right font-heading text-[clamp(2.1rem,8vw,10rem)] font-black uppercase leading-none tracking-tight text-[#0056FF]/50">
          Mission
          <br />
          Momentum
        </div>

        <motion.div
          ref={panelRef}
          style={{ rotateX, rotateZ, transformPerspective: 1300 }}
          className="relative mx-auto mt-12 max-w-4xl overflow-hidden rounded-[2rem] p-[1px] shadow-[0_28px_70px_rgba(25,25,112,0.11)] sm:mt-14"
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-[120%] rounded-[50%] bg-[conic-gradient(from_0deg,rgba(255,255,255,0)_0deg,rgba(227,231,252,0.9)_70deg,rgba(34,119,255,0.72)_130deg,rgba(255,255,255,0)_200deg,rgba(25,25,112,0.45)_270deg,rgba(255,255,255,0)_360deg)]"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          />
          <div className="absolute inset-0 rounded-[2rem] border border-white/70" />
          <div className="relative isolate overflow-hidden rounded-[2rem] border border-[#0056FF] px-4 py-14 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] sm:px-8 sm:py-16">
            {/* Reference wave art — large + centered so it reads like the design frame */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
              <img
                src="/marketing/vision-kinetic-wave.png"
                alt=""
                width={1600}
                height={900}
                decoding="async"
                fetchPriority="low"
                className="absolute left-1/2 top-[42%] h-[135%] w-[155%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover object-[52%_40%]"
              />
            </div>
            {/* Light veil — wave stays clearly visible */}
            <div
              className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-white/30 via-white/18 to-[#eef3ff]/40"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 z-[2] shadow-[inset_0_0_90px_rgba(255,255,255,0.55)]"
              aria-hidden
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-[-30%] z-[3] w-[40%] bg-gradient-to-r from-transparent via-white/35 to-transparent"
              animate={{ x: ["0%", "340%"] }}
              transition={{ repeat: Infinity, duration: 4.6, ease: "easeInOut" }}
            />
            <div className="relative z-10 space-y-1.5 text-[#0a0f2c]">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  data-vision-row
                  ref={(el) => {
                    rowsRef.current[index] = el;
                  }}
                  className="relative h-[96px] overflow-hidden whitespace-nowrap [filter:drop-shadow(0_2px_14px_rgba(255,255,255,0.85))]"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
