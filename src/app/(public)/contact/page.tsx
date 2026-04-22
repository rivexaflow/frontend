export default function ContactPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-bold text-[var(--rvx-midnight)]">Contact</h1>
      <p className="mt-2 text-sm text-[var(--rvx-midnight)]/75">Tell us about your rollout timeline and we will respond within one business day.</p>
      <form className="mt-6 space-y-3">
        <input className="w-full rounded-md border border-[var(--rvx-midnight)]/20 p-2 text-sm" placeholder="Full name" />
        <input className="w-full rounded-md border border-[var(--rvx-midnight)]/20 p-2 text-sm" placeholder="Work email" type="email" />
        <textarea className="w-full rounded-md border border-[var(--rvx-midnight)]/20 p-2 text-sm" rows={4} placeholder="How can we help?" />
        <button type="button" className="w-full rounded-md bg-[var(--rvx-royal)] py-2 text-sm font-semibold text-[var(--rvx-white)]">
          Submit (demo)
        </button>
      </form>
    </main>
  );
}
