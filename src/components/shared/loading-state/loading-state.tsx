export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-6 shadow-sm">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--rvx-azure)] border-t-transparent" />
      <p className="text-sm text-[var(--rvx-midnight)]/80">{label}</p>
    </div>
  );
}
