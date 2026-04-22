import { cn } from "@/lib/utils/cn";

type Props = {
  label: string;
  value: string;
  hint?: string;
  className?: string;
};

export function MetricCard({ label, value, hint, className }: Props) {
  return (
    <article className={cn("rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4 shadow-sm", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--rvx-midnight)]/60">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[var(--rvx-royal)]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--rvx-midnight)]/60">{hint}</p> : null}
    </article>
  );
}
