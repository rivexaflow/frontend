export default function AgentHomePage() {
  const tasks = [
    { title: "Call Follow-ups", count: 7 },
    { title: "KYC Uploads", count: 4 },
    { title: "CRM Notes Pending", count: 11 }
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-[var(--rvx-midnight)]">User Dashboard</h1>
        <p className="mt-2 text-sm text-[var(--rvx-midnight)]/70">Assigned module tasks, status tracking, and performance widgets.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {tasks.map((task) => (
          <article key={task.title} className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4 shadow-sm">
            <p className="text-sm text-[var(--rvx-midnight)]/70">{task.title}</p>
            <p className="text-2xl font-bold text-[var(--rvx-royal)]">{task.count}</p>
          </article>
        ))}
      </section>
      <section className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[var(--rvx-midnight)]">My Access</h2>
        <p className="mt-2 text-sm text-[var(--rvx-midnight)]/70">CRM contact view, KYC upload queue, assigned AI tools.</p>
      </section>
    </div>
  );
}
