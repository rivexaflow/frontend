"use client";

import type { LucideIcon } from "lucide-react";
import type { ElementType } from "react";

import { cn } from "@/lib/utils/cn";

/** @deprecated Legacy tones resolve to brand — only `brand` and `slate` are used in the UI. */
export type SidebarIconTone =
  | "brand"
  | "slate"
  | "blue"
  | "emerald"
  | "purple"
  | "amber"
  | "rose"
  | "cyan";

const palette: Record<"brand" | "slate", { idle: string; active: string }> = {
  brand: {
    idle: "bg-[#191970]/10 text-[#191970] ring-1 ring-[#191970]/8 dark:bg-[#2277FF]/12 dark:text-[#2277FF] dark:ring-[#2277FF]/15",
    active: "bg-gradient-to-br from-[#191970] to-[#2277ff] text-white shadow-sm shadow-[#191970]/25 ring-0",
  },
  slate: {
    idle: "bg-slate-100 text-slate-500 ring-1 ring-slate-200/80 dark:bg-slate-800/70 dark:text-slate-400 dark:ring-slate-700/80",
    active:
      "bg-gradient-to-br from-[#191970] to-[#2277ff] text-white shadow-sm shadow-[#191970]/20 ring-0",
  },
};

function resolveTone(tone: SidebarIconTone): "brand" | "slate" {
  return tone === "slate" ? "slate" : "brand";
}

type Props = {
  icon: LucideIcon | ElementType;
  active?: boolean;
  tone?: SidebarIconTone;
  size?: "sm" | "md";
  className?: string;
};

export function SidebarNavIcon({
  icon: Icon,
  active = false,
  tone = "brand",
  size = "md",
  className,
}: Props) {
  const colors = palette[resolveTone(tone)];
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-[1.03]",
        size === "sm" ? "h-7 w-7" : "h-8 w-8",
        active ? colors.active : colors.idle,
        className,
      )}
    >
      <Icon className={cn(size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")} strokeWidth={2.25} />
    </span>
  );
}
