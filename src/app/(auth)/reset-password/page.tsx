"use client";

import { FormEvent, useState } from "react";
import { z } from "zod";

const schema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string().min(8)
  })
  .refine((data) => data.password === data.confirm, { message: "Passwords must match", path: ["confirm"] });

export default function ResetPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = { password: String(form.get("password")), confirm: String(form.get("confirm")) };
    const result = schema.safeParse(payload);
    if (!result.success) {
      setMessage(null);
      setError(result.error.issues[0]?.message ?? "Invalid");
      return;
    }
    setError(null);
    setMessage("Password updated (demo). You can return to login.");
    event.currentTarget.reset();
  };

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4">
      <form onSubmit={onSubmit} className="w-full space-y-3 rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-[var(--rvx-midnight)]">Reset password</h1>
        <input type="password" name="password" placeholder="New password" className="w-full rounded-md border border-[var(--rvx-midnight)]/20 p-2 text-sm" />
        <input type="password" name="confirm" placeholder="Confirm password" className="w-full rounded-md border border-[var(--rvx-midnight)]/20 p-2 text-sm" />
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        {message ? <p className="text-xs text-green-700">{message}</p> : null}
        <button className="w-full rounded-md bg-[var(--rvx-royal)] py-2 text-sm font-semibold text-[var(--rvx-white)]">Update password</button>
      </form>
    </main>
  );
}
