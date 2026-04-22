type Props = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--rvx-midnight)]/20 bg-[var(--rvx-white)] p-8 text-center">
      <p className="text-base font-semibold text-[var(--rvx-midnight)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--rvx-midnight)]/70">{description}</p>
    </div>
  );
}
