export default function AiServicesPage() {
  const services = [
    { name: "WhatsApp Agent", status: "Enabled", runs: 128 },
    { name: "Bulk Messaging", status: "Enabled", runs: 42 },
    { name: "Document AI", status: "Pilot", runs: 31 },
    { name: "Email Automation", status: "Enabled", runs: 76 }
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-[var(--rvx-midnight)]">AI Services</h1>
        <p className="mt-2 text-sm text-[var(--rvx-midnight)]/70">Enable modules and monitor automated service activity.</p>
      </section>
      <section className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-5 shadow-sm">
        <div className="space-y-2">
          {services.map((service) => (
            <article key={service.name} className="flex items-center justify-between rounded-md bg-[var(--rvx-lavender)] px-3 py-2 text-sm">
              <div>
                <p className="font-medium text-[var(--rvx-midnight)]">{service.name}</p>
                <p className="text-xs text-[var(--rvx-midnight)]/60">{service.runs} runs today</p>
              </div>
              <span className="rounded bg-[var(--rvx-white)] px-2 py-1 text-xs text-[var(--rvx-midnight)]">{service.status}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
