export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--rvx-white)] text-[var(--rvx-black)]">
      <nav className="sticky top-0 z-20 border-b border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xl font-bold text-[var(--rvx-azure)]">Rivexaflow</p>
            <p className="text-xs text-[var(--rvx-midnight)]/80">AI-Driven Multi-Tenant Workspace</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="#services" className="hidden text-sm text-[var(--rvx-midnight)] md:inline">
              Services
            </a>
            <a href="#impact" className="hidden text-sm text-[var(--rvx-midnight)] md:inline">
              Impact
            </a>
            <a href="#faq" className="hidden text-sm text-[var(--rvx-midnight)] md:inline">
              FAQ
            </a>
            <a
              href="/login"
              className="rounded-lg border border-[var(--rvx-azure)] px-4 py-2 text-sm font-medium text-[var(--rvx-azure)] transition hover:bg-[var(--rvx-lavender)]"
            >
              Login
            </a>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 pb-16 pt-14 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="inline-flex rounded-full border border-[var(--rvx-midnight)]/20 bg-[var(--rvx-lavender)] px-3 py-1 text-xs text-[var(--rvx-midnight)]">
            Enterprise-Ready from Day 1
          </p>
          <h1 className="text-4xl font-bold leading-tight text-[var(--rvx-midnight)] md:text-5xl">
            The Operating System for
            <span className="block text-[var(--rvx-azure)]">Modern Business Teams</span>
          </h1>
          <p className="max-w-2xl text-[var(--rvx-midnight)]/80">
            Rivexaflow brings CRM, KYC, invoicing, automation, and live team operations into one clean workspace.
            Designed for fast-growing organizations that need control, speed, and scale.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/login"
              className="rounded-lg bg-[var(--rvx-royal)] px-5 py-3 text-sm font-semibold text-[var(--rvx-white)] hover:bg-[var(--rvx-azure)]"
            >
              Start with Demo Login
            </a>
            <a
              href="#vision"
              className="rounded-lg border border-[var(--rvx-azure)] px-5 py-3 text-sm font-semibold text-[var(--rvx-azure)] hover:bg-[var(--rvx-lavender)]"
            >
              Explore Rivexaflow
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--rvx-midnight)]/15 bg-[var(--rvx-lavender)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--rvx-midnight)]">What You Get Instantly</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--rvx-azure)]/30 bg-[var(--rvx-white)] p-4">
              <p className="text-2xl font-bold text-[var(--rvx-azure)]">Unified Ops</p>
              <p className="text-sm text-[var(--rvx-midnight)]/80">CRM, KYC, billing, and tasks in one place</p>
            </div>
            <div className="rounded-xl border border-[var(--rvx-azure)]/30 bg-[var(--rvx-white)] p-4">
              <p className="text-2xl font-bold text-[var(--rvx-azure)]">AI Agents</p>
              <p className="text-sm text-[var(--rvx-midnight)]/80">WhatsApp, docs, communication automation</p>
            </div>
            <div className="rounded-xl border border-[var(--rvx-azure)]/30 bg-[var(--rvx-white)] p-4">
              <p className="text-2xl font-bold text-[var(--rvx-azure)]">Live Monitoring</p>
              <p className="text-sm text-[var(--rvx-midnight)]/80">Track team actions and status in real-time</p>
            </div>
            <div className="rounded-xl border border-[var(--rvx-azure)]/30 bg-[var(--rvx-white)] p-4">
              <p className="text-2xl font-bold text-[var(--rvx-azure)]">Scale Ready</p>
              <p className="text-sm text-[var(--rvx-midnight)]/80">From one team to enterprise-wide operations</p>
            </div>
          </div>
        </div>
      </section>

      <section id="vision" className="mx-auto w-full max-w-7xl space-y-6 px-6 pb-16">
        <h2 className="text-3xl font-bold text-[var(--rvx-midnight)]">Vision</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "A single intelligent workspace for all daily business operations.",
            "Role-based productivity with secure and clean collaboration.",
            "AI-assisted workflows that reduce manual repetitive work."
          ].map((item) => (
            <article key={item} className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-5 shadow-sm">
              <p className="text-sm text-[var(--rvx-midnight)]/80">{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="services" className="mx-auto w-full max-w-7xl space-y-6 px-6 pb-16">
        <h2 className="text-3xl font-bold text-[var(--rvx-midnight)]">Services</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["CRM Service", "Lead management, contact lifecycle, and team collaboration."],
            ["KYC Service", "Faster verification operations with structured review queues."],
            ["Invoicing Service", "Create, track, and manage client billing from one panel."],
            ["WhatsApp Automation", "Message workflows, reminders, and conversation automation."],
            ["Document Intelligence", "AI-powered extraction and verification support."],
            ["Workflow Automation", "Connect operations across modules using smart triggers."]
          ].map(([title, desc]) => (
            <article key={title} className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-5 shadow-sm">
              <h3 className="font-semibold text-[var(--rvx-azure)]">{title}</h3>
              <p className="mt-2 text-sm text-[var(--rvx-midnight)]/80">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="impact" className="mx-auto w-full max-w-7xl space-y-6 px-6 pb-16">
        <h2 className="text-3xl font-bold text-[var(--rvx-midnight)]">Business Impact</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["42%", "Faster KYC turnaround"],
            ["55%", "Lower manual follow-up workload"],
            ["2.4x", "Higher team visibility for managers"],
            ["99.9%", "Platform uptime target"]
          ].map(([value, label]) => (
            <article key={label} className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-5 text-center shadow-sm">
              <p className="text-3xl font-bold text-[var(--rvx-royal)]">{value}</p>
              <p className="mt-1 text-sm text-[var(--rvx-midnight)]/70">{label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-6 px-6 pb-16">
        <h2 className="text-3xl font-bold text-[var(--rvx-midnight)]">Client Testimonials</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              quote:
                "We replaced 5 disconnected tools with Rivexaflow and finally got one clear operational workflow.",
              author: "Operations Director, FinEdge"
            },
            {
              quote:
                "The team dashboard helped us track agent productivity without constant manual follow-ups.",
              author: "Founder, NovaAssist"
            },
            {
              quote:
                "KYC and invoicing automation dramatically reduced our turnaround time for onboarding clients.",
              author: "COO, BlueOrbit Services"
            }
          ].map((item) => (
            <article key={item.author} className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-5 shadow-sm">
              <p className="text-sm text-[var(--rvx-midnight)]/80">&quot;{item.quote}&quot;</p>
              <p className="mt-3 text-xs font-semibold text-[var(--rvx-azure)]">{item.author}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto w-full max-w-7xl space-y-6 px-6 pb-16">
        <h2 className="text-3xl font-bold text-[var(--rvx-midnight)]">FAQ</h2>
        <div className="space-y-3">
          {[
            ["Who is Rivexaflow for?", "Growing companies that need structured operations and AI-enabled productivity."],
            ["Can we control agent permissions?", "Yes. Role-based controls are built-in for each workspace."],
            ["Can we start small and scale later?", "Yes. The platform is designed for single-team to enterprise growth."],
            ["Do you support custom workflows?", "Yes. Workflow and module enablement is configurable per organization."]
          ].map(([q, a]) => (
            <article key={q} className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-5 shadow-sm">
              <p className="font-semibold text-[var(--rvx-midnight)]">{q}</p>
              <p className="mt-2 text-sm text-[var(--rvx-midnight)]/75">{a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-16">
        <div className="rounded-2xl bg-[linear-gradient(120deg,#2277ff_0%,#0056ff_70%)] p-8 text-[var(--rvx-white)]">
          <h2 className="text-3xl font-bold">Ready to Launch Rivexaflow for Clients?</h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--rvx-lavender)]">
            Start with secure workspace onboarding, role-based modules, and a clean enterprise experience built for
            rapid scaling.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="/login" className="rounded-lg bg-[var(--rvx-white)] px-5 py-3 text-sm font-semibold text-[var(--rvx-royal)]">
              Login to Rivexaflow
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--rvx-midnight)]/10 bg-[var(--rvx-lavender)]/50">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-6">
          <p className="text-sm font-semibold text-[var(--rvx-midnight)]">Rivexaflow</p>
          <p className="text-xs text-[var(--rvx-midnight)]/70">
            Enterprise Multi-Tenant AI Workspace | Role-safe, Real-time, Scalable
          </p>
        </div>
      </footer>
    </main>
  );
}
