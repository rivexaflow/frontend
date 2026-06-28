"use client";

import { useEffect, useState } from "react";

import { useAttendanceClock } from "@/features/workspace/hooks/use-attendance-clock";
import { cn } from "@/lib/utils/cn";

function formatHours(hours: number | null) {
  if (hours === null) return null;
  const totalMinutes = Math.floor(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

function AnalogClockFace({ date }: { date: Date }) {
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getHours() % 12;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  return (
    <svg viewBox="0 0 100 100" className="h-[4.5rem] w-[4.5rem] shrink-0" aria-hidden>
      <defs>
        <linearGradient id="clockFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#191970" />
          <stop offset="100%" stopColor="#2277FF" />
        </linearGradient>
        <filter id="clockGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#clockFaceGrad)" opacity="0.12" />
      <circle cx="50" cy="50" r="44" fill="white" className="dark:fill-slate-900" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="url(#clockFaceGrad)" strokeWidth="2" opacity="0.35" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = Number((50 + Math.sin(angle) * 36).toFixed(4));
        const y1 = Number((50 - Math.cos(angle) * 36).toFixed(4));
        const x2 = Number((50 + Math.sin(angle) * (i % 3 === 0 ? 30 : 33)).toFixed(4));
        const y2 = Number((50 - Math.cos(angle) * (i % 3 === 0 ? 30 : 33)).toFixed(4));
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-600"
            strokeWidth={i % 3 === 0 ? 2 : 1}
            strokeLinecap="round"
          />
        );
      })}
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="28"
        stroke="#191970"
        strokeWidth="2.5"
        strokeLinecap="round"
        transform={`rotate(${hourDeg} 50 50)`}
        className="dark:stroke-[#2277FF]"
      />
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="22"
        stroke="#2277FF"
        strokeWidth="2"
        strokeLinecap="round"
        transform={`rotate(${minuteDeg} 50 50)`}
      />
      <line
        x1="50"
        y1="54"
        x2="50"
        y2="20"
        stroke="#ef4444"
        strokeWidth="1"
        strokeLinecap="round"
        transform={`rotate(${secondDeg} 50 50)`}
        filter="url(#clockGlow)"
      />
      <circle cx="50" cy="50" r="2.5" fill="#191970" className="dark:fill-[#2277FF]" />
    </svg>
  );
}

export function DashboardLiveClock({ embedded = false }: { embedded?: boolean }) {
  const { clockStatus, getLiveHoursWorked } = useAttendanceClock();
  const [now, setNow] = useState(() => new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const hours = mounted ? now.toLocaleTimeString("en-US", { hour: "2-digit", hour12: false }).slice(0, 2) : "00";
  const minutes = mounted ? now.toLocaleTimeString("en-US", { minute: "2-digit", hour12: false }) : "00";
  const seconds = mounted ? now.toLocaleTimeString("en-US", { second: "2-digit", hour12: false }) : "00";
  const weekday = mounted ? now.toLocaleDateString("en-US", { weekday: "long" }) : "Today";
  const monthDay = mounted ? now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  const worked = clockStatus?.isClockedIn && !clockStatus.isClockedOut ? formatHours(getLiveHoursWorked()) : null;
  const onShift = clockStatus?.isClockedIn && !clockStatus.isClockedOut;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-4",
        embedded
          ? "border border-white/60 bg-white/50 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/40"
          : "border border-slate-200/70 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80",
      )}
    >
      {!embedded ? (
        <>
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#2277FF]/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-[#191970]/10 blur-2xl" />
        </>
      ) : null}

      <div className="relative flex items-center gap-4">
        <div className="relative">
          <AnalogClockFace date={now} />
          {onShift ? (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
              Live
            </span>
          ) : null}
        </div>

        <div className="min-w-0">
          <div className="flex items-baseline gap-0.5 font-mono tabular-nums leading-none">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{hours}</span>
            <span className="animate-pulse text-2xl font-bold text-[#2277FF]">:</span>
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{minutes}</span>
            <span className="ml-1 text-sm font-semibold text-slate-400">{seconds}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-gradient-to-r from-[#191970] to-[#2277FF] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              {weekday}
            </span>
            <span className="text-xs font-medium text-slate-500">{monthDay}</span>
          </div>

          {worked ? (
            <p className={cn("mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400")}>
              Shift active · {worked} logged today
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-slate-400">Local workspace time</p>
          )}
        </div>
      </div>
    </div>
  );
}
