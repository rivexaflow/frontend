export default function AdminDashboardPage() {
  const stats = [
    { label: "Live Agents", value: "18", note: "currently online and active" },
    { label: "Open KYC Queue", value: "27", note: "documents awaiting review" },
    { label: "Invoices Pending", value: "11", note: "approval or payment pending" },
    { label: "CRM Leads", value: "302", note: "active prospects in pipeline" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--rvx-midnight)]">Organization Admin Dashboard</h1>
        <p className="text-sm text-[var(--rvx-midnight)]/70">
          Monitor team operations, prioritize workload, and track workspace performance.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {stats.map((item) => (
          <article key={item.label} className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-5 shadow-sm">
            <p className="text-sm font-medium text-[var(--rvx-midnight)]/80">{item.label}</p>
            <p className="mt-1 text-3xl font-bold text-[var(--rvx-royal)]">{item.value}</p>
            <p className="mt-1 text-xs text-[var(--rvx-midnight)]/60">{item.note}</p>
          </article>
        ))}
      </div>
      <section className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--rvx-midnight)]">Today&apos;s Priorities</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--rvx-midnight)]/80">
          <li>Review high-risk KYC submissions first.</li>
          <li>Follow up on overdue invoices from enterprise clients.</li>
          <li>Check agent idle alerts and rebalance assignments.</li>
        </ul>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4 shadow-sm">
          <p className="text-sm font-semibold text-[var(--rvx-midnight)]">Module Access</p>
          <p className="mt-2 text-xs text-[var(--rvx-midnight)]/70">WhatsApp, CRM, KYC, Invoices enabled</p>
        </article>
        <article className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4 shadow-sm">
          <p className="text-sm font-semibold text-[var(--rvx-midnight)]">Invite Queue</p>
          <p className="mt-2 text-xs text-[var(--rvx-midnight)]/70">3 invitations pending acceptance</p>
        </article>
        <article className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4 shadow-sm">
          <p className="text-sm font-semibold text-[var(--rvx-midnight)]">AI Agent Runs</p>
          <p className="mt-2 text-xs text-[var(--rvx-midnight)]/70">26 successful runs today</p>
        </article>
      </section>
    </div>
  );
}
