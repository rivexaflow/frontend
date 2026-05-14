import { MetricCard } from "@/components/shared/metric-card/metric-card";
import { PageHeader } from "@/components/shared/page-header/page-header";
import { StatusBadge } from "@/components/shared/status-badge/status-badge";
import { ChangePasswordCard } from "@/components/auth/change-password-card";

export default function SuperAdminHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform command center"
        description="Cross-tenant health, billing posture, and reliability signals for Rivexaflow operators."
        actions={<StatusBadge label="All systems nominal" tone="success" />}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Active tenants" value="42" hint="Across all plans" />
        <MetricCard label="Platform uptime" value="99.98%" hint="Rolling 30 days" />
        <MetricCard label="Open incidents" value="0" hint="No sev-1 events" />
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--rvx-midnight)]">Commercial signals</h2>
          <p className="mt-2 text-sm text-[var(--rvx-midnight)]/75">
            Net revenue retention is trending above target. Trials converting at 38% with strongest uptake in the
            Growth tier.
          </p>
        </article>
        <article className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--rvx-midnight)]">Infrastructure</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--rvx-midnight)]/75">
            <li>API latency p99 stable at 182ms.</li>
            <li>Database replicas healthy in all regions.</li>
            <li>Background workers cleared nightly backlog.</li>
          </ul>
        </article>
      </section>
      <ChangePasswordCard />
    </div>
  );
}
