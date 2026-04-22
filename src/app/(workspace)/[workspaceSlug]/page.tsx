import { MetricCard } from "@/components/shared/metric-card/metric-card";
import { PageHeader } from "@/components/shared/page-header/page-header";
import { StatusBadge } from "@/components/shared/status-badge/status-badge";

export default async function WorkspaceHomePage({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace overview"
        description={`Operational snapshot for ${workspaceSlug}. All figures are demo data for the POC.`}
        actions={<StatusBadge label="Healthy" tone="success" />}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active users" value="86" hint="Across all modules" />
        <MetricCard label="Automation runs" value="277" hint="Last 24 hours" />
        <MetricCard label="Open invoices" value="$182k" hint="Outstanding AR" />
        <MetricCard label="KYC queue" value="27" hint="Awaiting review" />
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--rvx-midnight)]">Executive summary</h2>
          <p className="mt-2 text-sm text-[var(--rvx-midnight)]/75">
            Operations remain within SLA targets. AI modules are stable with low error rates. Finance recommends focusing
            on overdue enterprise invoices this week.
          </p>
        </article>
        <article className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--rvx-midnight)]">Risk radar</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--rvx-midnight)]/75">
            <li>Two KYC cases flagged for manual escalation.</li>
            <li>WhatsApp throughput spike detected at 4 PM UTC.</li>
            <li>No platform incidents reported.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
