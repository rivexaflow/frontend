export default function TenantsPage() {
  const tenants = [
    { name: "Orion Logistics", users: 82, plan: "Growth", status: "Active" },
    { name: "Nexa Retail", users: 164, plan: "Enterprise", status: "Active" },
    { name: "BlueOrbit Services", users: 21, plan: "Starter", status: "Suspended" }
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-[var(--rvx-midnight)]">Tenant Registry</h1>
        <p className="mt-2 text-sm text-[var(--rvx-midnight)]/70">Provisioning, suspension, and plan controls for client workspaces.</p>
      </section>
      <section className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4 shadow-sm">
        <div className="space-y-2">
          {tenants.map((tenant) => (
            <article key={tenant.name} className="flex items-center justify-between rounded-md bg-[var(--rvx-lavender)] px-3 py-2 text-sm">
              <div>
                <p className="font-medium text-[var(--rvx-midnight)]">{tenant.name}</p>
                <p className="text-xs text-[var(--rvx-midnight)]/60">
                  {tenant.users} users | {tenant.plan}
                </p>
              </div>
              <span className="rounded bg-[var(--rvx-white)] px-2 py-1 text-xs text-[var(--rvx-midnight)]">{tenant.status}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
