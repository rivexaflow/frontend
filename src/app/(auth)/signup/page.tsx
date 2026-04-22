"use client";

import { FormEvent, useState } from "react";
import { signupSchema } from "@/schemas/auth.schema";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      company: String(form.get("company") ?? ""),
      ownerName: String(form.get("ownerName") ?? ""),
      email: String(form.get("email") ?? "")
    };
    const result = signupSchema.safeParse(payload);
    if (!result.success) {
      setSuccess(null);
      setError(result.error.issues[0]?.message ?? "Validation failed");
      return;
    }
    setError(null);
    setSuccess("Workspace request captured. Our team will reach out within one business day.");
    event.currentTarget.reset();
  };

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4">
      <form onSubmit={onSubmit} className="w-full space-y-3 rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-[var(--rvx-azure)]">Create workspace</h1>
        <p className="text-sm text-[var(--rvx-midnight)]/70">Tell us about your organization to begin onboarding.</p>
        <input name="company" placeholder="Company name" className="w-full rounded-md border border-[var(--rvx-midnight)]/20 p-2 text-sm" />
        <input name="ownerName" placeholder="Owner full name" className="w-full rounded-md border border-[var(--rvx-midnight)]/20 p-2 text-sm" />
        <input name="email" placeholder="Owner email" className="w-full rounded-md border border-[var(--rvx-midnight)]/20 p-2 text-sm" />
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        {success ? <p className="text-xs text-green-700">{success}</p> : null}
        <button className="w-full rounded-md bg-[var(--rvx-royal)] py-2 text-sm font-semibold text-[var(--rvx-white)]">Submit</button>
      </form>
    </main>
  );
}
