import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  trend?: string;
  trendTone?: "positive" | "neutral" | "negative";
  icon?: LucideIcon;
  className?: string;
};

export function AdminStatCard({
  label,
  value,
  hint,
  trend,
  trendTone = "neutral",
  icon: Icon,
  className,
}: Props) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition hover:border-slate-300/90 hover:shadow-[0_8px_24px_-12px_rgba(25,25,112,0.12)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-[#2277FF]/8 to-[#6366f1]/5 opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 text-[1.65rem] font-semibold leading-none tracking-tight text-[#191970]">{value}</p>
          {hint ? <p className="mt-2 text-xs leading-relaxed text-slate-500">{hint}</p> : null}
          {trend ? (
            <p
              className={cn(
                "mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                trendTone === "positive" && "bg-emerald-50 text-emerald-700",
                trendTone === "negative" && "bg-rose-50 text-rose-700",
                trendTone === "neutral" && "bg-slate-100 text-slate-600",
              )}
            >
              {trend}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff] text-[#4338ca]">
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
        ) : null}
      </div>
    </article>
  );
}
