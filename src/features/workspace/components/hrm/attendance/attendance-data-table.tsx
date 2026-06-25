"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import { cn } from "@/lib/utils/cn";

export type AttendanceTableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render: (row: T) => ReactNode;
};

type SortDir = "asc" | "desc";

type Props<T extends { id: string }> = {
  rows: T[];
  columns: AttendanceTableColumn<T>[];
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  onRowClick?: (row: T) => void;
  selectedId?: string | null;
  minWidth?: number;
  dense?: boolean;
  stickyHeader?: boolean;
  footer?: ReactNode;
};

export function AttendanceDataTable<T extends { id: string }>({
  rows,
  columns,
  emptyMessage = "No records match your filters.",
  emptyIcon,
  onRowClick,
  selectedId,
  minWidth = 900,
  dense = true,
  stickyHeader = true,
  footer,
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return rows;
    const sorted = [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv));
    });
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [rows, columns, sortKey, sortDir]);

  const toggleSort = (col: AttendanceTableColumn<T>) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      setSortDir("asc");
    }
  };

  const cellPy = dense ? "py-2" : "py-3";
  const cellPx = dense ? "px-3" : "px-4";

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-950/20">
        {emptyIcon}
        <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 shadow-sm dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" style={{ minWidth }}>
          <thead className={cn(stickyHeader && "sticky top-0 z-10")}>
            <tr
              className={cn(
                crm.tableHead,
                "border-b border-slate-200/80 bg-slate-50/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95",
              )}
            >
              {columns.map((col) => {
                const active = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    className={cn(
                      cellPx,
                      dense ? "py-2.5" : "py-3",
                      "text-[10px] font-bold uppercase tracking-wider text-slate-500",
                      col.sortable && "cursor-pointer select-none hover:text-[#191970] dark:hover:text-[#2277FF]",
                      col.headerClassName,
                      col.className,
                    )}
                    onClick={() => toggleSort(col)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable ? (
                        active ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-[#191970] dark:text-[#2277FF]" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-[#191970] dark:text-[#2277FF]" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )
                      ) : null}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedRows.map((row, index) => {
              const selected = selectedId === row.id;
              return (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "transition-colors",
                    onRowClick && "cursor-pointer",
                    crm.tableRow,
                    index % 2 === 1 && !selected && "bg-slate-50/50 dark:bg-slate-950/25",
                    selected && "bg-[#191970]/[0.06] dark:bg-[#2277FF]/10",
                    onRowClick && "hover:bg-[#2277FF]/[0.04] dark:hover:bg-[#2277FF]/10",
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn(cellPx, cellPy, col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {footer ? (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950/40">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export function AttendanceEmployeeCell({
  name,
  code,
  subtitle,
  size = "sm",
}: {
  name: string;
  code?: string;
  subtitle?: string;
  size?: "sm" | "md";
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarSize = size === "sm" ? "h-8 w-8 text-[10px]" : "h-9 w-9 text-[11px]";

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#191970] to-[#2277ff] font-bold text-white shadow-sm",
          avatarSize,
        )}
      >
        {initials}
      </span>
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-900 dark:text-white">{name}</p>
        {code ? <p className="font-mono text-[10px] text-slate-500">{code}</p> : null}
        {subtitle ? <p className="truncate text-[10px] text-slate-400">{subtitle}</p> : null}
      </div>
    </div>
  );
}
