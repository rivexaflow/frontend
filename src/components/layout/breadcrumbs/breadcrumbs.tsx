import Link from "next/link";

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
      {items.map((item, idx) => (
        <span key={`${item.label}-${idx}`} className="flex min-w-0 items-center gap-1.5">
          {idx > 0 ? (
            <span className="text-slate-300 dark:text-slate-600" aria-hidden>
              /
            </span>
          ) : null}
          {item.href ? (
            <Link
              href={item.href}
              className="truncate font-medium text-slate-500 transition hover:text-blue-600 dark:text-slate-400"
            >
              {item.label}
            </Link>
          ) : (
            <span className="truncate font-semibold text-slate-900 dark:text-white">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
