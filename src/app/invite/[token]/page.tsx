export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const isTokenValid = token.length > 8;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <section className="w-full rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Workspace Invite</h1>
        <p className="mt-2 text-sm text-[var(--rvx-midnight)]/70">Invite token: {token}</p>
        <p className="mt-2 text-xs text-[var(--rvx-midnight)]/60">
          {isTokenValid ? "Token is valid (demo check)." : "Token format invalid."}
        </p>
        <button
          disabled={!isTokenValid}
          className="mt-4 w-full rounded-md bg-[var(--rvx-royal)] py-2 text-sm font-semibold text-[var(--rvx-white)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Accept Invite
        </button>
      </section>
    </main>
  );
}
