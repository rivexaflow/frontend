"use client";

import { FormEvent, useState } from "react";
import { forgotPasswordSchema } from "@/schemas/auth.schema";

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = { email: String(form.get("email") ?? "") };
    const result = forgotPasswordSchema.safeParse(payload);
    if (!result.success) {
      setStatus(null);
      setError(result.error.issues[0]?.message ?? "Validation failed");
      return;
    }
    setError(null);
    setStatus("Reset link sent (demo).");
  };

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4">
      <form onSubmit={onSubmit} className="w-full space-y-3 rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-[var(--rvx-midnight)]">Forgot password</h1>
        <p className="text-sm text-[var(--rvx-midnight)]/70">Enter your workspace email.</p>
        <input name="email" placeholder="you@company.com" className="w-full rounded-md border border-[var(--rvx-midnight)]/20 p-2 text-sm" />
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        {status ? <p className="text-xs text-green-700">{status}</p> : null}
        <button className="w-full rounded-md bg-[var(--rvx-royal)] py-2 text-sm font-semibold text-[var(--rvx-white)]">Send reset link</button>
      </form>
    </main>
  );
}
