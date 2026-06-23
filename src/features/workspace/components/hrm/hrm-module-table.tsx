"use client";

import { HrmPageHeader, HrmPanel, HrmStatCard } from "@/features/workspace/components/hrm/hrm-page-header";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { cn } from "@/lib/utils/cn";

type Column<T> = { key: keyof T | string; label: string; render?: (row: T) => React.ReactNode };

export function HrmModuleTableView<T extends { id: string }>({
  module,
  title,
  description,
  stats,
  columns,
  rows,
  emptyMessage = "No records yet.",
}: {
  module: string;
  title: string;
  description: string;
  stats?: { label: string; value: string; hint?: string; icon: React.ElementType; tone?: "default" | "success" | "warning" | "brand" }[];
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
}) {
  return (
    <div className="pb-10">
      <HrmPageHeader module={module} title={title} description={description} />
      {stats?.length ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <HrmStatCard key={s.label} {...s} />
          ))}
        </div>
      ) : null}
      <HrmPanel title="Register" description={`${rows.length} record${rows.length === 1 ? "" : "s"}`}>
        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">{emptyMessage}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className={crm.tableHead}>
                  {columns.map((col) => (
                    <th key={String(col.key)} className="px-4 py-3 font-bold">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((row) => (
                  <tr key={row.id} className={crm.tableRow}>
                    {columns.map((col) => (
                      <td key={String(col.key)} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key as string] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </HrmPanel>
    </div>
  );
}

export function StatusPill({ label, tone = "default" }: { label: string; tone?: "default" | "success" | "warning" | "danger" }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        tone === "success" && "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
        tone === "warning" && "bg-amber-50 text-amber-700 ring-amber-600/15",
        tone === "danger" && "bg-rose-50 text-rose-700 ring-rose-600/15",
        tone === "default" && "bg-slate-100 text-slate-600 ring-slate-500/15",
      )}
    >
      {label}
    </span>
  );
}
