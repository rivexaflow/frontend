import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold text-[var(--rvx-azure)]">404</p>
      <h1 className="mt-2 text-3xl font-bold text-[var(--rvx-midnight)]">Page not found</h1>
      <p className="mt-2 text-sm text-[var(--rvx-midnight)]/75">The route you requested does not exist in this POC build.</p>
      <Link href="/" className="mt-6 inline-flex w-fit rounded-md bg-[var(--rvx-royal)] px-4 py-2 text-sm font-semibold text-[var(--rvx-white)]">
        Return home
      </Link>
    </main>
  );
}
