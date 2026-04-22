export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const isTokenValid = token.length > 8;

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4">
      <section className="w-full rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-[var(--rvx-midnight)]">Workspace invite</h1>
        <p className="mt-2 text-sm text-[var(--rvx-midnight)]/70">Token: {token}</p>
        <p className="mt-2 text-xs text-[var(--rvx-midnight)]/60">{isTokenValid ? "Token looks valid (demo check)." : "Token format invalid."}</p>
        <button
          type="button"
          disabled={!isTokenValid}
          className="mt-4 w-full rounded-md bg-[var(--rvx-royal)] py-2 text-sm font-semibold text-[var(--rvx-white)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Accept invite
        </button>
      </section>
    </main>
  );
}
