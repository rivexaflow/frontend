"use client";

import type { LucideIcon } from "lucide-react";
import { Globe, LayoutTemplate, Palette, Search, Sparkles } from "lucide-react";

import type { BrandingSectionId } from "@/features/workspace/schemas/branding.schema";
import { cn } from "@/lib/utils/cn";

const SECTION_ICONS: Record<BrandingSectionId, LucideIcon> = {
  identity: Sparkles,
  theme: Palette,
  domains: Globe,
  website: LayoutTemplate,
  seo: Search,
};

const SECTIONS: { id: BrandingSectionId; label: string }[] = [
  { id: "identity", label: "Identity" },
  { id: "theme", label: "Theme" },
  { id: "domains", label: "Domains" },
  { id: "website", label: "Website" },
  { id: "seo", label: "SEO & meta" },
];

type Props = {
  active: BrandingSectionId;
  onSelect: (id: BrandingSectionId) => void;
};

export function BrandingSectionNav({ active, onSelect }: Props) {
  return (
    <nav
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Branding sections"
    >
      {SECTIONS.map(({ id, label }) => {
        const Icon = SECTION_ICONS[id];
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition",
              isActive
                ? "border-[#2277FF]/50 bg-[#2277FF]/10 text-[#191970] shadow-sm dark:border-[#2277FF]/40 dark:bg-[#2277FF]/15 dark:text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
