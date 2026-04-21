export default function SuperAdminPage() {
  const cards = [
    { label: "Active Tenants", value: "42", note: "across 8 plans" },
    { label: "Platform Uptime", value: "99.98%", note: "last 30 days" },
    { label: "Open Incidents", value: "0", note: "all systems healthy" }
  ];
  const workspaces = [
    { name: "Orion Logistics", plan: "Growth", status: "Active" },
    { name: "Nexa Retail", plan: "Enterprise", status: "Active" },
    { name: "BlueOrbit Services", plan: "Starter", status: "Suspended" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--rvx-midnight)]">Platform Overview</h1>
        <p className="text-sm text-[var(--rvx-midnight)]/70">Super admin panel for tenants, billing, reliability, and audit governance.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4 shadow-sm">
            <p className="text-sm text-[var(--rvx-midnight)]/70">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-[var(--rvx-royal)]">{card.value}</p>
            <p className="text-xs text-[var(--rvx-midnight)]/60">{card.note}</p>
          </article>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--rvx-midnight)]">Workspace Health</h2>
          <div className="mt-3 space-y-2">
            {workspaces.map((ws) => (
              <div key={ws.name} className="flex items-center justify-between rounded-md bg-[var(--rvx-lavender)] px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-[var(--rvx-midnight)]">{ws.name}</p>
                  <p className="text-xs text-[var(--rvx-midnight)]/60">{ws.plan} plan</p>
                </div>
                <span className="rounded-full bg-[var(--rvx-white)] px-2 py-1 text-xs text-[var(--rvx-midnight)]">{ws.status}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--rvx-midnight)]">Billing and Alerts</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--rvx-midnight)]/80">
            <li>4 invoices generated today.</li>
            <li>1 workspace near plan usage limit.</li>
            <li>No critical errors in last 24 hours.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
