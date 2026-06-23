"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { BRAND_ASSETS } from "@/lib/marketing/brand-assets";
import {
  MARKETING_NAV_ITEMS,
  type MarketingNavItem,
  type MarketingNavLink,
  type MarketingNavMega,
} from "@/lib/marketing/nav-config";
import { cn } from "@/lib/utils";

const NAV_LINK_BASE =
  "relative px-4 py-2 text-[15px] font-bold tracking-normal transition-colors lg:px-5 lg:text-base";

function navLinkClass(active: boolean) {
  return cn(
    NAV_LINK_BASE,
    active
      ? "text-[#2277FF] after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:rounded-full after:bg-[#2277FF] lg:after:left-5 lg:after:right-5"
      : "text-slate-800 hover:text-[#2277FF]",
  );
}

function isLinkActive(pathname: string, href: string, activeHash: string): boolean {
  if (href.startsWith("/#")) {
    return pathname === "/" && activeHash === href.slice(1);
  }
  if (href === "/") {
    return pathname === "/" && !activeHash;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavBarSurface({ scrolled }: { scrolled: boolean }) {
  return cn(
    "border-b transition-[background-color,box-shadow,border-color] duration-300",
    scrolled
      ? "border-slate-200/70 bg-white/92 shadow-[0_10px_40px_rgba(15,23,42,0.08)]"
      : "border-white/50 bg-white/55 shadow-[0_4px_28px_rgba(34,119,255,0.07)]",
    "backdrop-blur-2xl backdrop-saturate-150",
  );
}

function MegaMenuPanel({
  item,
  panelId,
  onNavigate,
}: {
  item: MarketingNavMega;
  panelId: string;
  onNavigate?: () => void;
}) {
  return (
    <div
      id={panelId}
      role="menu"
      className="w-full rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.14),0_8px_24px_rgba(34,119,255,0.1)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4 sm:px-8 sm:py-5">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#2277FF]">
          {item.panelTitle}
        </p>
        <Link
          href={item.href}
          onClick={onNavigate}
          className="text-sm font-semibold text-slate-600 transition hover:text-[#2277FF]"
        >
          {item.panelCta} →
        </Link>
      </div>
      <div className="grid gap-6 px-6 py-6 sm:grid-cols-2 sm:px-8 sm:py-7 lg:grid-cols-4 lg:gap-8">
        {item.columns.map((column) => (
          <div key={column.title}>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.1em] text-slate-500">
              {column.title}
            </p>
            <ul className="space-y-1.5">
              {column.items.map((link) => (
                <li key={`${column.title}-${link.label}`}>
                  <MegaMenuLink link={link} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function MegaMenuLink({
  link,
  onNavigate,
}: {
  link: MarketingNavLink;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      role="menuitem"
      className="group block rounded-xl px-3 py-3 transition hover:bg-slate-50"
    >
      <span className="block text-base font-semibold text-slate-900 group-hover:text-[#2277FF]">
        {link.label}
      </span>
      {link.description ? (
        <span className="mt-1 block text-sm leading-relaxed text-slate-600">{link.description}</span>
      ) : null}
    </Link>
  );
}

function DesktopNavItem({
  item,
  pathname,
  activeHash,
  openMenu,
  setOpenMenu,
}: {
  item: MarketingNavItem;
  pathname: string;
  activeHash: string;
  openMenu: string | null;
  setOpenMenu: (id: string | null) => void;
}) {
  const menuId = useId();

  if (item.type === "link") {
    const active = isLinkActive(pathname, item.href, activeHash);
    return (
      <Link
        href={item.href}
        className={navLinkClass(active)}
        aria-current={active ? "page" : undefined}
      >
        {item.label}
      </Link>
    );
  }

  const open = openMenu === item.label;
  const active = isLinkActive(pathname, item.href, activeHash);

  return (
    <button
      type="button"
      className={cn(navLinkClass(active), "inline-flex items-center gap-1.5")}
      aria-expanded={open}
      aria-haspopup="true"
      aria-controls={menuId}
      onMouseEnter={() => setOpenMenu(item.label)}
      onClick={() => setOpenMenu(open ? null : item.label)}
    >
      {item.label}
      <ChevronDown
        className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        aria-hidden
      />
    </button>
  );
}

function MobileNavSection({
  item,
  pathname,
  activeHash,
  onNavigate,
}: {
  item: MarketingNavItem;
  pathname: string;
  activeHash: string;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (item.type === "link") {
    const active = isLinkActive(pathname, item.href, activeHash);
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "block rounded-lg px-3 py-3 text-base font-semibold",
          active ? "text-[#2277FF]" : "text-slate-800 hover:text-[#2277FF]",
        )}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-800"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        {item.label}
        <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
      </button>
      {expanded ? (
        <div className="space-y-3 border-t border-slate-100 px-3 py-3">
          {item.columns.map((column) => (
            <div key={column.title}>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                {column.title}
              </p>
              <ul className="space-y-1">
                {column.items.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link
                      href={link.href}
                      onClick={onNavigate}
                      className="block rounded-md px-2 py-2 text-base font-medium text-slate-800 hover:bg-white hover:text-[#2277FF]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <Link
            href={item.href}
            onClick={onNavigate}
            className="inline-flex text-xs font-semibold text-[#2277FF]"
          >
            {item.panelCta} →
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function FloatingMarketingNav() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const lastScrollY = useRef(0);
  const scrollTicking = useRef(false);

  const [scrollHidden, setScrollHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeHash, setActiveHash] = useState("");
  const megaMenuId = useId();
  const openMegaItem = MARKETING_NAV_ITEMS.find(
    (item): item is MarketingNavMega => item.type === "mega" && item.label === openMenu,
  );

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash.replace(/^#/, ""));
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  useEffect(() => {
    lastScrollY.current = typeof window !== "undefined" ? window.scrollY : 0;

    const onScroll = () => {
      if (scrollTicking.current) return;
      scrollTicking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const prev = lastScrollY.current;
        const delta = y - prev;
        const threshold = 8;

        setScrolled(y > 12);

        if (y < 48) {
          setScrollHidden(false);
        } else if (delta > threshold) {
          setScrollHidden(true);
          setMobileOpen(false);
          setOpenMenu(null);
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

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      {mobileOpen && !scrollHidden ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-[98] bg-slate-900/25 backdrop-blur-[2px]"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-[100]",
          scrollHidden ? "pointer-events-none" : "pointer-events-auto",
        )}
        initial={false}
        animate={{
          y: scrollHidden ? "-100%" : 0,
          opacity: scrollHidden ? 0 : 1,
        }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
        }
        aria-hidden={scrollHidden ? true : undefined}
      >
        <nav
          aria-label="Main navigation"
          className={cn("w-full overflow-visible font-sans", NavBarSurface({ scrolled }))}
        >
          <div
            className="relative mx-auto w-full max-w-[min(100%,96rem)] px-4 sm:px-6 lg:px-8"
            onMouseLeave={() => setOpenMenu(null)}
          >
            <div className="flex h-[4rem] w-full items-center justify-between gap-6 sm:h-[4.25rem] lg:gap-10">
            <Link
              href="/"
              className="inline-flex min-w-0 shrink-0 items-center outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#2277FF]/40"
              onClick={() => setMobileOpen(false)}
              aria-label="Rivexaflow home"
            >
              <Image
                src={BRAND_ASSETS.logoFull}
                alt="Rivexaflow"
                width={156}
                height={36}
                className="h-8 w-auto max-w-[min(42vw,11.5rem)] object-contain object-left sm:h-9"
                priority
              />
            </Link>

            <div className="hidden min-w-0 flex-1 items-center justify-center gap-x-1 lg:gap-x-2 xl:gap-x-4 lg:flex">
              {MARKETING_NAV_ITEMS.map((item) => (
                <DesktopNavItem
                  key={item.type === "link" ? item.href : item.label}
                  item={item}
                  pathname={pathname}
                  activeHash={activeHash}
                  openMenu={openMenu}
                  setOpenMenu={setOpenMenu}
                />
              ))}
            </div>

            <div className="hidden shrink-0 items-center gap-3 lg:flex">
              <Link
                href="/login"
                className="px-2 py-2 text-[15px] font-bold text-slate-800 transition hover:text-[#2277FF] lg:text-base"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-[#050a1f] px-5 py-2.5 text-[15px] font-bold text-white shadow-[0_6px_20px_rgba(15,23,42,0.2)] transition hover:bg-[#191970] lg:text-base"
              >
                Get started
              </Link>
            </div>

            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-800 outline-none transition hover:border-[#2277FF]/30 hover:bg-white focus-visible:ring-2 focus-visible:ring-[#2277FF]/40 lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="marketing-nav-mobile"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            </div>

            <AnimatePresence>
              {openMegaItem ? (
                <motion.div
                  key={openMegaItem.label}
                  className="absolute inset-x-4 top-full z-50 pt-3 sm:inset-x-6 lg:inset-x-8"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  onMouseEnter={() => setOpenMenu(openMegaItem.label)}
                >
                  <MegaMenuPanel item={openMegaItem} panelId={megaMenuId} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div
            id="marketing-nav-mobile"
            className={cn(
              "overflow-hidden border-t border-slate-100/90 transition-[max-height,opacity] duration-250 lg:hidden",
              mobileOpen ? "max-h-[min(85vh,720px)] overflow-y-auto opacity-100" : "max-h-0 opacity-0",
            )}
            aria-hidden={!mobileOpen}
          >
            <div className="space-y-2 px-4 py-3 sm:px-6">
              {MARKETING_NAV_ITEMS.map((item) => (
                <MobileNavSection
                  key={item.type === "link" ? item.href : item.label}
                  item={item}
                  pathname={pathname}
                  activeHash={activeHash}
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
              <div className="flex gap-2 border-t border-slate-100 pt-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-800"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg bg-[#050a1f] py-2.5 text-center text-sm font-semibold text-white"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </motion.header>
    </>
  );
}
