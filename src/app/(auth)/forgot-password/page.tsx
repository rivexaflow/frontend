"use client";

import { FormEvent, useState } from "react";
import { z } from "zod";

const schema = z.object({
  email: z.email("Enter a valid account email")
});

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = { email: String(form.get("email") ?? "") };
    const result = schema.safeParse(payload);
    if (!result.success) {
      setStatus(null);
      setError(result.error.issues[0]?.message ?? "Validation failed");
      return;
    }
    setError(null);
    setStatus("Reset link sent successfully (demo).");
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <form onSubmit={onSubmit} className="w-full space-y-3 rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Forgot Password</h1>
        <p className="text-sm text-[var(--rvx-midnight)]/70">Enter your workspace email to receive reset instructions.</p>
        <input name="email" placeholder="you@company.com" className="w-full rounded-md border border-[var(--rvx-midnight)]/20 p-2 text-sm" />
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        {status ? <p className="text-xs text-green-700">{status}</p> : null}
        <button className="w-full rounded-md bg-[var(--rvx-royal)] py-2 text-sm font-semibold text-[var(--rvx-white)]">Send reset link</button>
      </form>
    </main>
  );
}
