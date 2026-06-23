"use client";

import { useEffect, useRef, useState } from "react";
import { Delete, TrendingUp } from "lucide-react";

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
  showInput?: boolean;
};

// Play DTMF synthesized dial tone using Web Audio API
const playDialTone = (digit: string) => {
  try {
    const frequencies: Record<string, [number, number]> = {
      "1": [697, 1209], "2": [697, 1336], "3": [697, 1477],
      "4": [770, 1209], "5": [770, 1336], "6": [770, 1477],
      "7": [852, 1209], "8": [852, 1336], "9": [852, 1477],
      "*": [941, 1209], "0": [941, 1336], "#": [941, 1477],
    };
    const freq = frequencies[digit];
    if (!freq) return;

    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.frequency.value = freq[0];
    osc2.frequency.value = freq[1];

    gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.error("Audio tone generator error", e);
  }
};

export function DialerKeypad({
  value,
  onDigit,
  onBackspace,
  onChange,
  compact,
  disabled,
  variant = "light",
  showInput = true,
}: Props) {
  const isDark = variant === "dark";

  return (
    <div className={cn("mx-auto w-full", compact ? "max-w-[240px]" : "max-w-[300px]")}>
      {showInput && (
        <div
          className={cn(
            "mb-5 rounded-2xl border transition-all duration-300 shadow-sm relative",
            isDark
              ? "border-white/10 bg-black/20 focus-within:border-white/30 focus-within:ring-2 focus-within:ring-white/10"
              : "border-slate-200/85 bg-slate-50/80 focus-within:border-[#191970] focus-within:ring-2 focus-within:ring-[#191970]/10 dark:border-slate-700 dark:bg-slate-950/40",
          )}
        >
          <input
            type="tel"
            value={value}
            readOnly={!onChange}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            placeholder="Enter number"
            className={cn(
              "w-full bg-transparent text-center font-mono font-semibold tracking-[0.08em] outline-none placeholder:font-sans placeholder:tracking-normal transition-all py-3 px-12",
              isDark ? "text-2xl text-white placeholder:text-white/40" : "text-2xl text-slate-900 dark:text-white",
              compact && "text-lg",
            )}
          />
          {value && (
            <button
              type="button"
              onClick={onBackspace}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 active:scale-[0.9] active:duration-75",
                isDark
                  ? "text-white/60 hover:text-white hover:bg-white/10"
                  : "text-slate-400 hover:text-[#191970] hover:bg-[#191970]/[0.06] dark:hover:bg-slate-800"
              )}
              title="Backspace"
            >
              <Delete className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        {KEYPAD_KEYS.flat().map((key) => {
          const letters = KEYPAD_LETTERS[key];
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => {
                playDialTone(key);
                onDigit(key);
              }}
              className={cn(
                "flex flex-col items-center justify-center rounded-2xl font-semibold transition-all duration-150 active:scale-[0.93] active:duration-75 disabled:opacity-50 shadow-sm",
                isDark
                  ? "h-[52px] border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.12] hover:border-white/20 hover:scale-[1.02]"
                  : "h-[58px] border border-slate-200/90 bg-white text-slate-800 hover:border-[#191970]/30 hover:bg-[#191970]/[0.05] hover:scale-[1.03] active:bg-[#191970]/10 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-950/20",
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


    </div>
  );
}

export function DialerWaveform({ active }: { active?: boolean }) {
  return (
    <>
      <style>{`
        @keyframes dialer-wave-anim {
          0%, 100% { height: 4px; }
          50% { height: 26px; }
        }
      `}</style>
      <div className="flex h-8 items-center justify-center gap-[3px]">
        {Array.from({ length: 15 }).map((_, i) => {
          const delay = i * 0.08;
          const duration = 0.6 + (i % 3) * 0.15;
          return (
            <span
              key={i}
              style={
                active
                  ? {
                      animation: "dialer-wave-anim 1.2s ease-in-out infinite",
                      animationDelay: `${delay}s`,
                      animationDuration: `${duration}s`,
                    }
                  : { height: "4px" }
              }
              className={cn(
                "w-[3px] rounded-full bg-emerald-400 transition-all duration-300",
                active ? "" : "opacity-40",
              )}
            />
          );
        })}
      </div>
    </>
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm",
        tone === "neutral" && "bg-white/10 text-white/80 border border-white/10",
        tone === "live" && "bg-amber-400/20 text-amber-100 border border-amber-400/20 animate-pulse",
        tone === "success" && "bg-emerald-400/20 text-emerald-100 border border-emerald-400/20",
        tone === "warning" && "bg-amber-500/20 text-amber-100 border border-amber-500/20",
      )}
    >
      {(tone === "live" || tone === "success") && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "live" && "animate-pulse bg-amber-300",
            tone === "success" && "bg-emerald-300 animate-pulse",
          )}
        />
      )}
      {label}
    </span>
  );
}

function useAnimatedNumber(target: number, duration = 600): number {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);

  useEffect(() => {
    const from = prevRef.current;
    if (from === target) return;
    prevRef.current = target;
    const start = performance.now();
    let raf: number;
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return display;
}

function KpiCard({
  label,
  value,
  accent = "#191970",
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  const isNumeric = typeof value === "number";
  const animated = useAnimatedNumber(isNumeric ? (value as number) : 0);

  // Flash animation when value changes — useLayoutEffect is synchronous post-render
  const [flash, setFlash] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      setFlash(true);
      const t = window.setTimeout(() => setFlash(false), 800);
      return () => window.clearTimeout(t);
    }
  }, [value]);

  return (
    <div
      className={cn(
        dialer.kpiCard,
        "transition-all duration-300 hover:shadow-md hover:-translate-y-[1px] overflow-hidden",
        flash && "ring-2 ring-inset ring-current",
      )}
      style={flash ? { color: accent } : undefined}
    >
      {/* glow blob */}
      <div
        className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-25 blur-2xl transition-all duration-500"
        style={{ background: accent }}
      />
      {/* flash highlight overlay */}
      {flash && (
        <div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-10 animate-ping-once"
          style={{ background: accent }}
        />
      )}
      <p className={dialer.kpiLabel}>{label}</p>
      <p
        className={cn(
          dialer.kpiValue,
          "mt-1 tabular-nums transition-all duration-300",
          flash && "scale-110",
        )}
        style={flash ? { color: accent } : undefined}
      >
        {isNumeric ? animated : value}
      </p>
      {flash && (
        <span
          className="absolute bottom-2 right-2 flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider animate-fade-in"
          style={{ color: accent }}
        >
          <TrendingUp className="h-2.5 w-2.5" />
          Live
        </span>
      )}
    </div>
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
        <KpiCard key={item.label} label={item.label} value={item.value} accent={item.accent} />
      ))}
    </div>
  );
}
