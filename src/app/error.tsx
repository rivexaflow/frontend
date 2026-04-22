"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-lg px-6 py-16 text-[#7f1d1d]">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm">{error.message}</p>
      <button type="button" onClick={() => reset()} className="mt-6 rounded-md bg-[#991b1b] px-4 py-2 text-sm text-white">
        Try again
      </button>
    </main>
  );
}
