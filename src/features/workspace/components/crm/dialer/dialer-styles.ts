/** Dialer-specific visual tokens — navy softphone aesthetic. */

export const dialer = {
  workspace:
    "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_40px_rgba(25,25,112,0.08)] dark:border-slate-800 dark:bg-slate-900",
  kpiCard:
    "relative overflow-hidden rounded-xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50/80 p-3 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950/80",
  kpiValue: "text-xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white",
  kpiLabel: "text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400",
  phoneStage:
    "relative overflow-hidden bg-gradient-to-b from-[#0f0f3d] via-[#191970] to-[#12124a] text-white",
  phoneStageGlow:
    "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,255,255,0.12),transparent)]",
  glassCard:
    "rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
  queueItem:
    "group relative rounded-xl border border-transparent px-3 py-2.5 transition hover:border-slate-200/80 hover:bg-slate-50/80 dark:hover:border-slate-700 dark:hover:bg-slate-800/40",
  queueItemActive:
    "border-[#191970]/20 bg-[#191970]/[0.04] shadow-[inset_3px_0_0_#191970]",
  controlDock:
    "border-t border-slate-100/80 bg-gradient-to-t from-slate-50 to-white px-5 py-5 dark:border-slate-800 dark:from-slate-950/50 dark:to-slate-900",
  endCall:
    "flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[0_8px_24px_rgba(225,29,72,0.35)] transition hover:scale-105 hover:from-rose-600 hover:to-rose-700 active:scale-95",
  callFab:
    "flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-[0_8px_28px_rgba(16,185,129,0.4)] transition hover:scale-105 active:scale-95 disabled:opacity-40 disabled:shadow-none",
} as const;

export const KEYPAD_LETTERS: Record<string, string> = {
  "2": "ABC",
  "3": "DEF",
  "4": "GHI",
  "5": "JKL",
  "6": "MNO",
  "7": "PQRS",
  "8": "TUV",
  "9": "WXYZ",
  "0": "+",
};

export const CALL_SCRIPT_SNIPPETS = [
  "Intro & value prop",
  "Discovery questions",
  "Book demo",
  "Follow-up email",
] as const;
