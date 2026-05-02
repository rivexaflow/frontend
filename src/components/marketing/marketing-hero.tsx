"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import { HeroCreativeWaveBackground } from "@/components/marketing/hero-creative-wave-background";
import { HeroThreadGap, HeroThreadUnderlay } from "@/components/marketing/hero-scroll-thread";

type CarouselItem = {
  id: number;
  image: string;
  alt: string;
};

/** Fewer drop-shadows = much cheaper paint; keeps depth + bottom falloff. */
const HERO_METAL_FILTER = [
  "drop-shadow(0 -1px 0 rgba(255,255,255,1))",
  "drop-shadow(0 2px 0 #1e2b7a)",
  "drop-shadow(0 5px 0 #3b1780)",
  "drop-shadow(0 8px 3px rgba(8,4,26,0.3))",
].join(" ");

/** Narrow glass specular + deep cobalt→indigo→plum face (reads dark on bright bg). */
const HERO_METAL_GRADIENTS = [
  "linear-gradient(102deg,#ffffff 0%,#eaf0ff 4%,rgba(147,174,255,0.72) 8%,transparent 16%,transparent 100%)",
  "linear-gradient(186deg,#4f6dff 4%,#3a45d4 22%,#2a2890 48%,#21155e 69%,#150536 89%,#050010 100%)",
].join(", ");

function Hero3DTitle({ title }: { title: string }) {
  const sizeClass =
    "font-heading select-none text-center text-[clamp(3.75rem,15vw,9.85rem)] font-bold uppercase leading-[0.94] tracking-[0.08em] antialiased";

  return (
    <>
      <div className="mx-auto mt-2 flex w-full justify-center px-2 pb-6 pt-1 [contain:layout]" aria-hidden>
        <div className="relative grid w-max shrink-0 origin-center place-items-center text-center [transform:scaleX(1.16)_translateZ(0)] sm:[transform:scaleX(1.2)_translateZ(0)]">
          <span
            className={`${sizeClass} col-start-1 row-start-1 translate-y-[9px]`}
            style={{
              color: "#03000e",
              opacity: 0.38,
            }}
          >
            {title}
          </span>
          <span
            className={`${sizeClass} col-start-1 row-start-1 translate-y-[6px]`}
            style={{
              color: "#1a0a52",
              opacity: 0.46,
            }}
          >
            {title}
          </span>
          <span
            className={`${sizeClass} col-start-1 row-start-1 translate-y-[3px]`}
            style={{
              color: "#2d2088",
              opacity: 0.52,
            }}
          >
            {title}
          </span>
          <span
            className={`${sizeClass} col-start-1 row-start-1 z-[1]`}
            style={{
              backgroundImage: HERO_METAL_GRADIENTS,
              backgroundSize: "100% 100%, 100% 100%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
              WebkitTextStroke: "min(3px,0.048em) rgba(226,237,255,0.62)",
              filter: HERO_METAL_FILTER,
            }}
          >
            {title}
          </span>
        </div>
      </div>
    </>
  );
}

/** Local hero strip images (`public/heroimage/`). Duplicated so the arc has enough slides. */
const HERO_CAROUSEL_SOURCES = [
  "/heroimage/heroimage1.jpeg",
  "/heroimage/heroimage2.jpeg",
  "/heroimage/heroimage3.jpeg",
  "/heroimage/heroimage4.jpeg",
  "/heroimage/heroimage5.jpeg",
  "/heroimage/heroimage6.jpeg",
  "/heroimage/heroimage7.jpeg",
  "/heroimage/heroimage8.jpeg",
  "/heroimage/heroimage9.jpeg",
] as const;

const CAROUSEL_ITEMS: CarouselItem[] = HERO_CAROUSEL_SOURCES.map((image, index) => ({
  id: index + 1,
  image,
  alt: `Rivexaflow showcase ${index + 1}`,
}));

const CAROUSEL_ARC = {
  visibleHalf: 4.9,
  curveWidth: 1240,
  curveDepth: 198,
  baselineY: 8,
  rotateMax: 19,
  speed: 0.42,
} as const;

function HeroArcCarousel({
  items,
  paused,
}: {
  items: readonly CarouselItem[];
  paused: boolean;
}) {
  const phaseRef = useRef(0);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (paused) return;

    const total = items.length;
    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const half = total / 2;
    const { visibleHalf, curveWidth, curveDepth, baselineY, rotateMax, speed } = CAROUSEL_ARC;

    const applyTransforms = () => {
      const phase = phaseRef.current;
      for (let index = 0; index < total; index += 1) {
        const el = slideRefs.current[index];
        if (!el) continue;

        let d = (index - phase + total) % total;
        if (d > half) d -= total;

        if (Math.abs(d) > visibleHalf + 1.2) {
          el.style.visibility = "hidden";
          el.style.opacity = "0";
          continue;
        }

        el.style.visibility = "visible";
        const t = Math.max(-1, Math.min(1, d / visibleHalf));
        const x = t * curveWidth;
        const y = baselineY + Math.pow(Math.abs(t), 1.55) * curveDepth;
        const rotate = t * rotateMax;
        const scale = 1.03 - Math.abs(t) * 0.18;
        const opacity = 1 - Math.abs(t) * 0.22;
        const z = Math.round((1 - Math.abs(t)) * 30);

        el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`;
        el.style.opacity = String(opacity);
        el.style.zIndex = String(z);
      }
    };

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduceMotion) {
        phaseRef.current = (phaseRef.current + dt * speed) % total;
      }
      applyTransforms();
      raf = requestAnimationFrame(tick);
    };

    applyTransforms();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [items.length, paused]);

  return (
    <>
      {items.map((item, index) => (
        <div
          key={item.id}
          ref={(el) => {
            slideRefs.current[index] = el;
          }}
          className="absolute left-1/2 top-1/2 will-change-transform [backface-visibility:hidden]"
          style={{
            transform: "translate(-50%, -50%) translateZ(0)",
            transformOrigin: "center center",
          }}
        >
          <article className="h-[clamp(268px,44vh,520px)] w-[clamp(210px,21vw,380px)] overflow-hidden rounded-[6px] bg-white shadow-[0_18px_48px_rgba(25,25,112,0.22)]">
            <img
              src={item.image}
              alt={item.alt}
              className="h-full w-full object-cover"
              width={560}
              height={720}
              decoding="async"
              sizes="(max-width: 768px) 35vw, 280px"
              loading={index < 3 ? "eager" : "lazy"}
              fetchPriority={index < 3 ? "high" : "low"}
            />
          </article>
        </div>
      ))}
    </>
  );
}

export function MarketingHero() {
  const [isSpread, setIsSpread] = useState(false);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const zoomScale = useTransform(scrollYProgress, [0, 0.75, 1], [1, 1.95, 2.15]);
  const zoomY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.3, 0.55], [1, 1, 0]);
  const headingY = useTransform(scrollYProgress, [0, 0.55], [0, -36]);
  const layerOpacity = useTransform(scrollYProgress, [0, 0.9, 1], [1, 1, 0.2]);

  useEffect(() => {
    const spreadId = window.setTimeout(() => setIsSpread(true), 260);
    return () => window.clearTimeout(spreadId);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setCarouselPaused(!entry?.isIntersecting || entry.intersectionRatio < 0.02);
      },
      { root: null, rootMargin: "80px", threshold: [0, 0.02, 0.06, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[132vh] shrink-0 overflow-x-clip overflow-y-visible bg-[#ffffff] text-[#191970]"
    >
      {/*
        Tail ≈ 32vh beyond sticky — enough for carousel/zoom scrub without a huge blank run before About.
      */}
      {/* Sticky viewport: blades, title, carousel only */}
      <div className="sticky top-0 relative h-screen min-h-screen overflow-x-clip overflow-y-visible bg-transparent">
        <HeroCreativeWaveBackground className="z-0" />
        {/* Soft blue/lilac bloom under carousel so the scroll ribbon reads grounded “behind” the cards */}
        <HeroThreadUnderlay scrollYProgress={scrollYProgress} />

        <motion.div
          style={{ opacity: headingOpacity, y: headingY }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="pointer-events-none absolute left-1/2 top-[4.5rem] z-[70] w-full max-w-[min(100%,72rem)] -translate-x-1/2 px-4 text-center sm:top-[5.25rem] sm:px-6 md:top-[5.5rem]"
        >
          
          <h1 className="sr-only font-heading">Rivexaflow — governed enterprise AI workspace for CRM, KYC, and billing</h1>
          <Hero3DTitle title="Rivexaflow" />
          <div className="relative z-[71] mx-auto mt-4 max-w-[min(100%,64rem)] pb-[min(2.75rem,7vh)] sm:mt-4 sm:pb-[min(3.25rem,8vh)]">
            <div className="flex justify-center overflow-x-auto overflow-y-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <p className="font-subheading inline-block max-w-none px-4 text-center text-[clamp(0.8125rem,calc(0.55rem+1.85vw),1.375rem)] font-medium leading-normal tracking-[0.01em] text-[#0f1638] antialiased whitespace-nowrap sm:px-5 sm:text-[clamp(0.9375rem,calc(0.65rem+1.35vw),1.5rem)] md:text-[clamp(1.0625rem,0.8rem+0.9vw,1.6875rem)]">
                One platform for CRM, KYC, billing, and workflows —{" "}
                <span className="font-semibold text-[#0a0f2c]">governed, fast, audit-ready.</span>
              </p>
            </div>
          </div>
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0 z-[12] w-full overflow-x-clip overflow-y-visible select-none">
          <motion.div
            style={{ scale: zoomScale, y: zoomY, opacity: layerOpacity }}
            initial={{ scale: 0.34, opacity: 0.55, y: 72 }}
            animate={{ scale: isSpread ? 1 : 0.34, opacity: 1, y: isSpread ? 0 : 72 }}
            transition={{ duration: 1.25, ease: [0.22, 0.61, 0.36, 1] }}
            className="absolute bottom-0 left-1/2 h-[min(76vh,800px)] w-[150vw] -translate-x-1/2"
          >
          <HeroArcCarousel items={CAROUSEL_ITEMS} paused={carouselPaused} />

          <div className="pointer-events-none absolute bottom-[-8vh] left-1/2 h-[20vh] w-[120vw] -translate-x-1/2 rounded-[100%] bg-white/92" />
          </motion.div>
        </div>
      </div>

      <HeroThreadGap scrollYProgress={scrollYProgress} />
    </section>
  );
}
