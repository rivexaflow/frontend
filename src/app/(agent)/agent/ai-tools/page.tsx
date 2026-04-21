export default function AgentAiToolsPage() {
  const assignedTools = [
    { tool: "WhatsApp Reply Assistant", access: "Granted" },
    { tool: "KYC Document Extractor", access: "Granted" },
    { tool: "Invoice Draft Generator", access: "Pending" }
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-[var(--rvx-midnight)]">User AI Tools Access</h1>
        <p className="mt-2 text-sm text-[var(--rvx-midnight)]/70">Role-scoped AI assistants enabled by organization admin.</p>
      </section>
      <section className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4 shadow-sm">
        <div className="space-y-2">
          {assignedTools.map((item) => (
            <article key={item.tool} className="flex items-center justify-between rounded-md bg-[var(--rvx-lavender)] px-3 py-2 text-sm">
              <p className="text-[var(--rvx-midnight)]">{item.tool}</p>
              <span className="rounded bg-[var(--rvx-white)] px-2 py-1 text-xs text-[var(--rvx-midnight)]">{item.access}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
