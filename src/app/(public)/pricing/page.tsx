import Link from "next/link";

export default function PricingPage() {
  const tiers = [
    { name: "Starter", price: "$249", seats: "Up to 25 seats", features: ["CRM + KYC", "Email support", "Core reports"] },
    { name: "Growth", price: "$749", seats: "Up to 120 seats", features: ["AI modules", "SLA support", "Live monitoring"] },
    { name: "Enterprise", price: "Custom", seats: "Unlimited scale", features: ["Dedicated success", "Custom integrations", "Private audit"] }
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-sm font-semibold text-[var(--rvx-azure)]">Pricing</p>
      <h1 className="mt-2 text-4xl font-bold text-[var(--rvx-midnight)]">Plans that scale with your workspace</h1>
      <p className="mt-3 max-w-2xl text-sm text-[var(--rvx-midnight)]/75">
        Transparent tiers for organizations adopting Rivexaflow. Numbers shown are representative for the POC demo.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <article key={tier.name} className="rounded-2xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[var(--rvx-midnight)]">{tier.name}</h2>
            <p className="mt-2 text-3xl font-bold text-[var(--rvx-royal)]">{tier.price}</p>
            <p className="text-xs text-[var(--rvx-midnight)]/60">{tier.seats}</p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--rvx-midnight)]/80">
              {tier.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <Link href="/login" className="mt-6 inline-flex w-full justify-center rounded-lg bg-[var(--rvx-royal)] py-2 text-sm font-semibold text-[var(--rvx-white)]">
              Start demo
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
