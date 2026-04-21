export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="rounded-xl border border-rose-700 bg-rose-950/30 p-8 text-center">
        <h1 className="text-2xl font-semibold">403 - Forbidden</h1>
        <p className="mt-2 text-sm text-[var(--rvx-midnight)]/80">You do not have access to this area.</p>
      </div>
    </main>
  );
}
