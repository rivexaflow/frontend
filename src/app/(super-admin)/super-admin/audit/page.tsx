export default function AuditPage() {
  const logs = [
    { at: "10:42 AM", action: "Workspace suspended", actor: "system@rivexaflow.com" },
    { at: "09:15 AM", action: "Plan changed to Enterprise", actor: "ops@rivexaflow.com" },
    { at: "08:02 AM", action: "Super Admin login success", actor: "platform.owner@rivexaflow.com" }
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-[var(--rvx-midnight)]">Audit Logs</h1>
        <p className="mt-2 text-sm text-[var(--rvx-midnight)]/70">Immutable system-level activity and compliance traces.</p>
      </section>
      <section className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4 shadow-sm">
        <div className="space-y-2">
          {logs.map((log) => (
            <article key={`${log.at}-${log.action}`} className="rounded-md bg-[var(--rvx-lavender)] px-3 py-2">
              <p className="text-sm font-medium text-[var(--rvx-midnight)]">{log.action}</p>
              <p className="text-xs text-[var(--rvx-midnight)]/65">
                {log.at} | {log.actor}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
