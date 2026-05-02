"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

/** Dark blue → deep purple chrome (replacing flat black). */
const NAV_SHELL =
  "bg-gradient-to-br from-[#08142c] via-[#121036] to-[#1f0f3f] backdrop-blur-xl";

const NAV_SHELL_TAB =
  "bg-gradient-to-br from-[#0c1834] via-[#151240] to-[#24124a] backdrop-blur-md";

type NavItem = { href: string; label: string };

const NAV: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
];

function useMdUp(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia("(min-width: 768px)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false,
  );
}

function activeIndexForPath(pathname: string): number {
  const hit = NAV.findIndex((item) => {
    if (item.href === "/") return pathname === "/";
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });
  return hit >= 0 ? hit : 0;
}

/** Collapsed pill → expanded bar + top tab; hover / tap; headroom hide on scroll down. */
export function FloatingMarketingNav() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const mdUp = useMdUp();
  const navRef = useRef<HTMLElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const lastScrollY = useRef(0);
  const scrollTicking = useRef(false);

  /** null = rested state: pill sits on route-active item, label reads white on dark chrome */
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const [scrollHidden, setScrollHidden] = useState(false);

  const [pill, setPill] = useState({ x: 0, y: 0, w: 0, h: 0, opacity: 0 });

  const activeNavIndex = activeIndexForPath(pathname);

  useEffect(() => {
    setHoveredIndex(null);
  }, [pathname]);

  /** Hide on scroll down, show on scroll up (headroom). Near top of page always visible. */
  useEffect(() => {
    lastScrollY.current = typeof window !== "undefined" ? window.scrollY : 0;

    const onScroll = () => {
      if (scrollTicking.current) return;
      scrollTicking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const prev = lastScrollY.current;
        const delta = y - prev;
        const threshold = 10;

        if (y < 56) {
          setScrollHidden(false);
        } else if (delta > threshold) {
          setScrollHidden(true);
          setHoverExpanded(false);
          setPinned(false);
        } else if (delta < -threshold) {
          setScrollHidden(false);
        }

        lastScrollY.current = y;
        scrollTicking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const desktop = mdUp;
  const layoutExpand = pinned || hoverExpanded || focusInside;

  const refreshPill = useCallback(() => {
    const row = rowRef.current;
    const el =
      hoveredIndex !== null && layoutExpand ? linkRefs.current[hoveredIndex] : null;
    if (!row || !el) {
      setPill((p) => ({ ...p, opacity: 0 }));
      return;
    }
    const rr = row.getBoundingClientRect();
    const lr = el.getBoundingClientRect();
    setPill({
      x: lr.left - rr.left + row.scrollLeft,
      y: lr.top - rr.top + row.scrollTop,
      w: lr.width,
      h: lr.height,
      opacity: 1,
    });
  }, [hoveredIndex, layoutExpand]);

  useLayoutEffect(() => {
    refreshPill();
  }, [refreshPill, pathname]);

  useEffect(() => {
    if (!layoutExpand) return;

    const onResize = () => refreshPill();
    window.addEventListener("resize", onResize);

    let ro: ResizeObserver | undefined;
    if (rowRef.current && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => refreshPill());
      ro.observe(rowRef.current);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
    };
  }, [layoutExpand, refreshPill]);

  const blurIfOutside = () => {
    queueMicrotask(() => {
      if (!navRef.current?.contains(document.activeElement)) {
        setFocusInside(false);
        setHoveredIndex(null);
      }
    });
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (mdUp) setHoverExpanded(true);
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (!mdUp) return;
    setHoveredIndex(null);
    setHoverExpanded(false);
    blurIfOutside();
  };

  const spring = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 440, damping: 36 };

  return (
    <>
      {!desktop && pinned && !scrollHidden && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-[95] bg-white/70 backdrop-blur-[2px] dark:bg-black/50"
          onClick={() => setPinned(false)}
        />
      )}

      <motion.header
        ref={navRef}
        aria-hidden={scrollHidden ? true : undefined}
        className={cn(
          "pointer-events-none fixed left-1/2 top-3 z-[100] flex w-max max-w-[min(calc(100vw-1rem),32rem)] -translate-x-1/2 justify-center px-2 sm:top-5 sm:max-w-[min(calc(100vw-2rem),30rem)]",
          scrollHidden && "pointer-events-none",
        )}
        initial={false}
        animate={{
          y: scrollHidden ? -120 : 0,
          opacity: scrollHidden ? 0 : 1,
        }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav
          aria-label="Main navigation"
          className={cn(
            "relative isolate mx-auto w-full max-w-full",
            scrollHidden ? "pointer-events-none" : "pointer-events-auto",
          )}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onFocusCapture={() => setFocusInside(true)}
          onBlurCapture={blurIfOutside}
        >
          {/* Top tab + brand mark — visible only when expanded */}
          <div
            className={cn(
              "relative z-30 flex justify-center transition-opacity duration-200",
              layoutExpand ? "opacity-100" : "pointer-events-none h-0 opacity-0",
            )}
          >
            <Link
              href="/"
              className={cn(
                "-mb-px flex min-h-[28px] min-w-[4.25rem] items-center justify-center rounded-t-lg px-4 pb-2.5 pt-1.5 outline-none ring-[#2277FF] ring-offset-2 ring-offset-white transition hover:brightness-110 focus-visible:ring-2 dark:ring-offset-slate-950",
                NAV_SHELL_TAB,
              )}
              style={{
                boxShadow: "inset 0 -1px 0 rgba(227,231,252,0.12), inset 0 2px 0 rgba(147,174,255,0.08)",
              }}
              onClick={() => !desktop && setPinned(false)}
            >
              <span className="bg-gradient-to-br from-[#93c5fd] via-[#a5b4fc] to-[#e9d5ff] bg-clip-text font-heading text-[13px] italic font-bold tracking-tight text-transparent sm:text-sm">
                RVX
              </span>
            </Link>
          </div>

          <div
            className={cn(
              "relative z-40 border border-[#93c5fd]/20 transition-[border-radius,box-shadow,padding] duration-300 dark:border-[#a5b4fc]/15",
              NAV_SHELL,
              layoutExpand ?
                "-mt-px rounded-2xl px-1.5 pb-2 pt-1 shadow-[0_16px_48px_-16px_rgba(12,8,40,0.55),inset_0_1px_0_rgba(163,190,255,0.12)] sm:px-2.5 sm:pb-2.5 sm:pt-1"
              : "rounded-[999px] px-6 py-2.5 shadow-[0_12px_40px_-14px_rgba(10,14,52,0.5)] sm:px-8 sm:py-3",
            )}
          >
            {/* Collapsed: brand + dot */}
            <div
              className={cn(
                "flex items-center justify-center gap-3 transition-opacity duration-150",
                layoutExpand && "hidden",
              )}
            >
              <button
                type="button"
                className="inline-flex items-center gap-3 rounded-full font-heading text-[1.05rem] font-bold italic leading-none tracking-tight text-[#eceef9] outline-none ring-[#2277FF] ring-offset-4 ring-offset-[#0f1430]/80 focus-visible:ring-2 md:hidden dark:ring-offset-slate-950 sm:text-[1.1rem]"
                aria-expanded={pinned}
                aria-controls="floating-nav-expanded"
                onClick={() => setPinned((p) => !p)}
              >
                <span>Rivexaflow</span>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#cfd6ff] shadow-[0_0_16px_rgba(147,174,255,0.88)]" />
              </button>

              <Link
                href="/"
                className="hidden items-center gap-3 md:inline-flex"
                aria-label="Rivexaflow home"
              >
                <span className="font-heading text-[1.05rem] font-bold italic leading-none tracking-tight text-[#eceef9] sm:text-[1.1rem] lg:text-[1.15rem]">
                  Rivexaflow
                </span>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#cfd6ff] shadow-[0_0_16px_rgba(147,174,255,0.88)]" />
              </Link>
            </div>

            {/* Expanded links */}
            <div
              id="floating-nav-expanded"
              className={cn(
                "transition-[opacity,visibility] duration-200",
                layoutExpand ?
                  "visible relative opacity-100"
                : "pointer-events-none invisible absolute inset-x-2 top-14 opacity-0",
              )}
              aria-hidden={!layoutExpand}
            >
              <div
                ref={rowRef}
                className="relative mx-auto flex w-max max-w-full flex-wrap justify-center gap-x-0.5 gap-y-2 px-0.5 pb-0.5 pt-0 sm:flex-nowrap sm:gap-x-1 sm:gap-y-0 sm:px-1 md:gap-x-1.5"
              >
                {layoutExpand && (
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute z-0 rounded-xl bg-gradient-to-br from-[#c7dcff] via-[#d4d9ff] to-[#e9e0ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:from-[#6b93ff]/95 dark:via-[#8792ff]/90 dark:to-[#c4b0ff]/90"
                    animate={{
                      opacity: pill.opacity,
                      left: pill.x,
                      top: pill.y,
                      width: pill.w,
                      height: pill.h,
                    }}
                    initial={false}
                    transition={spring}
                    style={{ position: "absolute", margin: 0 }}
                  />
                )}

                {NAV.map((item, i) => {
                  const isActiveRoute =
                    item.href === "/" ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const pillHere = hoveredIndex !== null && hoveredIndex === i;

                  let labelClass: string;
                  if (pillHere) {
                    labelClass = "font-semibold text-[#070711] dark:text-black dark:opacity-95";
                  } else if (hoveredIndex === null && i === activeNavIndex) {
                    labelClass = "font-semibold text-white";
                  } else if (hoveredIndex !== null && isActiveRoute) {
                    labelClass = "text-[#b8c2f0]/88";
                  } else {
                    labelClass = "text-[#dde3fb]/93";
                  }

                  let dotClass: string;
                  if (pillHere) {
                    dotClass = "bg-[#0a0a14] dark:bg-white";
                  } else if (hoveredIndex === null && i === activeNavIndex) {
                    dotClass = "bg-white shadow-[0_0_10px_rgba(255,255,255,0.45)]";
                  } else if (hoveredIndex !== null && isActiveRoute) {
                    dotClass = "bg-[#b8c2f0]/55";
                  } else {
                    dotClass = cn(
                      "bg-[#cfd6ff]/50",
                      item.href === "/login" && "ring-2 ring-[#2277FF]/55 ring-offset-2 ring-offset-[#121036]",
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      ref={(el) => {
                        linkRefs.current[i] = el;
                      }}
                      tabIndex={layoutExpand ? 0 : -1}
                      className={cn(
                        "relative z-[1] flex min-w-[3.65rem] flex-col items-center gap-1 px-1.5 py-1 text-center outline-none sm:min-w-[3.95rem] sm:px-2 sm:py-1.5",
                        "outline-offset-4 focus-visible:ring-2 focus-visible:ring-[#2277FF]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent",
                      )}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onFocus={() => setHoveredIndex(i)}
                      onClick={() => !desktop && setPinned(false)}
                    >
                      <span
                        className={cn(
                          "h-1 w-1 shrink-0 rounded-full transition-colors duration-150 sm:h-1.5 sm:w-1.5",
                          dotClass,
                        )}
                        aria-hidden
                      />
                      <span
                        className={cn(
                          "font-medium uppercase tracking-[0.14em] sm:tracking-[0.18em]",
                          "text-[9px] sm:text-[10px] md:text-[11px]",
                          labelClass,
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>
      </motion.header>
    </>
  );
}
