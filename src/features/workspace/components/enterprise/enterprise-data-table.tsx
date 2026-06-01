"use client";

import { MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type TableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
};

type Props<T extends { id: string }> = {
  columns: TableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
  renderActions?: (row: T) => React.ReactNode;
};

export function EnterpriseDataTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = "No records match your filters.",
  renderActions,
}: Props<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
              <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-5 py-4", col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                  <td className="px-5 py-4 text-right">
                    {renderActions ? (
                      renderActions(row)
                    ) : (
                      <button
                        type="button"
                        className="inline-flex rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                        aria-label="Row actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StatusBadge({
  label,
  tone = "slate",
}: {
  label: string;
  tone?: "emerald" | "amber" | "blue" | "rose" | "slate" | "purple";
}) {
  const styles: Record<typeof tone, string> = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        styles[tone],
      )}
    >
      {label}
    </span>
  );
}
