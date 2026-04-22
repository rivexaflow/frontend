import { PageHeader } from "@/components/shared/page-header/page-header";
import { MetricCard } from "@/components/shared/metric-card/metric-card";

type Props = {
  title: string;
  description: string;
  bullets: string[];
};

export function WorkspaceModulePanel({ title, description, bullets }: Props) {
  const metrics = bullets.slice(0, 3).map((text, idx) => ({
    label: `Signal ${idx + 1}`,
    value: text.split(":")[0]?.trim() ?? text,
    hint: text.includes(":") ? text.split(":").slice(1).join(":").trim() : "Demo metric"
  }));

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} hint={m.hint} />
        ))}
      </div>
      <section className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-[var(--rvx-midnight)]">Operational checklist</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--rvx-midnight)]/80">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
