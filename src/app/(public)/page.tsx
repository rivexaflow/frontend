import Link from "next/link";
import { MarketingHero } from "@/components/marketing/marketing-hero";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--rvx-white)] text-[var(--rvx-black)]">
      <div className="flex min-h-[100dvh] flex-col">
        <nav className="sticky top-0 z-20 shrink-0 border-b border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)]/95 backdrop-blur">
          <div className="mx-auto flex h-12 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex min-w-0 items-baseline gap-2 sm:gap-3">
              <p className="truncate text-base font-bold leading-none text-[var(--rvx-azure)] sm:text-lg">Rivexaflow</p>
              <p className="hidden truncate text-[10px] font-medium uppercase tracking-wide text-[var(--rvx-midnight)]/55 sm:inline sm:text-[11px]">
                AI-Driven Multi-Tenant Workspace
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
              <Link href="/about" className="hidden text-xs text-[var(--rvx-midnight)]/85 md:inline md:text-[13px]">
                About
              </Link>
              <Link href="/pricing" className="hidden text-xs text-[var(--rvx-midnight)]/85 md:inline md:text-[13px]">
                Pricing
              </Link>
              <Link href="/contact" className="hidden text-xs text-[var(--rvx-midnight)]/85 md:inline md:text-[13px]">
                Contact
              </Link>
              <a href="#services" className="hidden text-xs text-[var(--rvx-midnight)]/85 lg:inline lg:text-[13px]">
                Services
              </a>
              <a href="#impact" className="hidden text-xs text-[var(--rvx-midnight)]/85 lg:inline lg:text-[13px]">
                Impact
              </a>
              <a href="#faq" className="hidden text-xs text-[var(--rvx-midnight)]/85 lg:inline lg:text-[13px]">
                FAQ
              </a>
              <Link
                href="/login"
                className="rounded-md border border-[var(--rvx-azure)] px-3 py-1.5 text-xs font-medium text-[var(--rvx-azure)] transition hover:bg-[var(--rvx-lavender)] md:px-3.5 md:text-[13px]"
              >
                Login
              </Link>
            </div>
          </div>
        </nav>

        <MarketingHero />
      </div>

      <section id="vision" className="mx-auto w-full max-w-7xl space-y-6 px-6 pb-16 pt-16">
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
            <Link href="/login" className="rounded-lg bg-[var(--rvx-white)] px-5 py-3 text-sm font-semibold text-[var(--rvx-royal)]">
              Login to Rivexaflow
            </Link>
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
