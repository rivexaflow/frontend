import Link from "next/link";

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs text-[var(--rvx-midnight)]/60">
      {items.map((item, idx) => (
        <span key={`${item.label}-${idx}`} className="flex items-center gap-2">
          {idx > 0 ? <span>/</span> : null}
          {item.href ? (
            <Link href={item.href} className="hover:text-[var(--rvx-azure)]">
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--rvx-midnight)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
