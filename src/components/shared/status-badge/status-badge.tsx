import { cn } from "@/lib/utils/cn";

type Tone = "success" | "warning" | "neutral" | "danger";

const tones: Record<Tone, string> = {
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  warning: "bg-amber-50 text-amber-900 border-amber-200",
  neutral: "bg-[var(--rvx-lavender)] text-[var(--rvx-midnight)] border-[var(--rvx-midnight)]/10",
  danger: "bg-rose-50 text-rose-800 border-rose-200"
};

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", tones[tone])}>
      {label}
    </span>
  );
}
