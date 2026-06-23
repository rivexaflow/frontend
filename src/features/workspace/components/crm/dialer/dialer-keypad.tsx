"use client";

import { Delete } from "lucide-react";

import { dialer, KEYPAD_LETTERS } from "@/features/workspace/components/crm/dialer/dialer-styles";
import { cn } from "@/lib/utils/cn";

const KEYPAD_KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "#"],
] as const;

type Props = {
  value: string;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onChange?: (value: string) => void;
  compact?: boolean;
  disabled?: boolean;
  variant?: "light" | "dark";
};

export function DialerKeypad({
  value,
  onDigit,
  onBackspace,
  onChange,
  compact,
  disabled,
  variant = "light",
}: Props) {
  const isDark = variant === "dark";

  return (
    <div className={cn("mx-auto w-full", compact ? "max-w-[240px]" : "max-w-[300px]")}>
      <div
        className={cn(
          "mb-5 rounded-2xl border px-4 py-3 text-center",
          isDark
            ? "border-white/10 bg-black/20"
            : "border-slate-200/80 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-950/40",
        )}
      >
        <input
          type="tel"
          value={value}
          readOnly={!onChange}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder="Enter number"
          className={cn(
            "w-full bg-transparent text-center font-mono font-semibold tracking-[0.08em] outline-none placeholder:font-sans placeholder:tracking-normal",
            isDark ? "text-2xl text-white placeholder:text-white/40" : "text-2xl text-slate-900 dark:text-white",
            compact && "text-lg",
          )}
        />
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {KEYPAD_KEYS.flat().map((key) => {
          const letters = KEYPAD_LETTERS[key];
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onDigit(key)}
              className={cn(
                "flex flex-col items-center justify-center rounded-2xl font-semibold transition active:scale-95 disabled:opacity-50",
                isDark
                  ? "h-[52px] border border-white/10 bg-white/[0.07] text-white hover:bg-white/[0.12]"
                  : "h-[58px] border border-slate-200/90 bg-white text-slate-800 shadow-sm hover:border-[#191970]/25 hover:bg-[#191970]/[0.04] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
                compact && (isDark ? "h-11" : "h-12"),
              )}
            >
              <span className={cn("leading-none", compact ? "text-base" : "text-xl")}>{key}</span>
              {letters ? (
                <span
                  className={cn(
                    "mt-0.5 text-[8px] font-bold tracking-[0.18em]",
                    isDark ? "text-white/45" : "text-slate-400",
                  )}
                >
                  {letters}
                </span>
              ) : (
                <span className="h-2.5" />
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={disabled || !value}
        onClick={onBackspace}
        className={cn(
          "mx-auto mt-4 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition disabled:opacity-40",
          isDark
            ? "text-white/70 hover:bg-white/10 hover:text-white"
            : "border border-slate-200/90 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900",
        )}
      >
        <Delete className="h-3.5 w-3.5" />
        Backspace
      </button>
    </div>
  );
}

export function DialerWaveform({ active }: { active?: boolean }) {
  return (
    <div className="flex h-8 items-end justify-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={cn(
            "w-1 rounded-full bg-emerald-400/90",
            active ? "animate-pulse" : "h-2 opacity-40",
          )}
          style={
            active
              ? {
                  height: `${12 + (i % 3) * 8}px`,
                  animationDelay: `${i * 120}ms`,
                  animationDuration: "0.8s",
                }
              : { height: "8px" }
          }
        />
      ))}
    </div>
  );
}

export function DialerStatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "live" | "success" | "warning";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
        tone === "neutral" && "bg-white/10 text-white/80",
        tone === "live" && "bg-amber-400/20 text-amber-100",
        tone === "success" && "bg-emerald-400/20 text-emerald-100",
        tone === "warning" && "bg-amber-500/20 text-amber-100",
      )}
    >
      {(tone === "live" || tone === "success") && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "live" && "animate-pulse bg-amber-300",
            tone === "success" && "bg-emerald-300",
          )}
        />
      )}
      {label}
    </span>
  );
}

export function DialerKpiStrip({
  items,
}: {
  items: { label: string; value: string | number; accent?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className={dialer.kpiCard}>
          <div
            className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-30 blur-2xl"
            style={{ background: item.accent ?? "#191970" }}
          />
          <p className={dialer.kpiLabel}>{item.label}</p>
          <p className={cn(dialer.kpiValue, "mt-1")}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}
