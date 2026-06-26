"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useMemo } from "react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import {
  buildRosterRows,
  exportRosterCsv,
  ROSTER_LEGEND,
  rosterLegendFor,
  type RosterCode,
} from "@/features/workspace/data/hrm-attendance-roster";
import type { EmployeeAttendanceProfile } from "@/features/workspace/data/hrm-attendance-salary-month";
import { cn } from "@/lib/utils/cn";

const LOGO_WATERMARK = "/brand/logo-full.png";
const SUMMARY_CODES = ["P", "A", "W"] as const;
const DAY_CELL = "h-9 w-9 min-w-9 max-w-9";
const CELL_BORDER = "border border-slate-200 dark:border-slate-700";

type Props = {
  profiles: EmployeeAttendanceProfile[];
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
};

function DayCell({ code, title }: { code: RosterCode | null; title: string }) {
  if (!code) {
    return (
      <td
        className={cn(DAY_CELL, CELL_BORDER, "bg-white p-0 dark:bg-slate-950")}
        title={title}
        aria-hidden
      />
    );
  }
  const legend = rosterLegendFor(code);
  return (
    <td
      title={title}
      className={cn(
        DAY_CELL,
        CELL_BORDER,
        "p-0 text-center text-[11px] font-bold leading-9",
        legend.cellClass,
      )}
    >
      {code}
    </td>
  );
}

export function AttendanceRosterMonthGrid({ profiles, year, month, onMonthChange }: Props) {
  const { rows, monthLabel } = useMemo(
    () => buildRosterRows(profiles, year, month),
    [profiles, year, month],
  );

  const dayHeaders = rows[0]?.days ?? [];

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    onMonthChange(d.getFullYear(), d.getMonth());
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-slate-950">
      {/* Toolbar — single professional strip like reference */}
      <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50 md:flex-row md:items-center md:justify-between md:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="flex h-8 w-8 items-center justify-center border-r border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[8.5rem] px-3 text-center text-sm font-semibold text-slate-800 dark:text-slate-100">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="flex h-8 w-8 items-center justify-center border-l border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <span className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            All employees
            <span className="ml-1.5 text-[#191970] dark:text-[#2277FF]">{rows.length}</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">
            {ROSTER_LEGEND.map((item) => (
              <span
                key={item.code}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300"
              >
                <span
                  className={cn(
                    "inline-flex h-4 w-4 items-center justify-center text-[9px] font-bold text-white",
                    item.legendClass,
                  )}
                >
                  {item.code}
                </span>
                {item.label}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => exportRosterCsv(rows, monthLabel)}
            disabled={!rows.length}
            className={cn(crm.btnSecondarySm, "h-8")}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Grid panel */}
      <div className="relative flex-1 p-4 md:p-5">
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <Image
            src={LOGO_WATERMARK}
            alt=""
            width={520}
            height={150}
            className="max-w-[min(70vw,36rem)] select-none opacity-[0.035] dark:opacity-[0.05]"
          />
        </div>

        <div
          className={cn(
            "relative overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950",
            "max-h-[calc(100dvh-12.5rem)]",
          )}
        >
          {!rows.length ? (
            <p className="py-20 text-center text-sm text-slate-500">No employees on this roster.</p>
          ) : (
            <table className="w-max min-w-full border-collapse text-xs">
              <colgroup>
                <col className="w-[11.5rem]" />
                {dayHeaders.map((d) => (
                  <col key={d.day} className="w-9" />
                ))}
                {SUMMARY_CODES.map((code) => (
                  <col key={code} className="w-10" />
                ))}
              </colgroup>
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900">
                  <th
                    className={cn(
                      CELL_BORDER,
                      "sticky left-0 z-30 bg-slate-50 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-900",
                    )}
                  >
                    Employee
                  </th>
                  {dayHeaders.map((d) => (
                    <th
                      key={d.day}
                      className={cn(DAY_CELL, CELL_BORDER, "bg-slate-50 p-0 font-normal dark:bg-slate-900")}
                    >
                      <div className="flex h-full flex-col items-center justify-center leading-none">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{d.day}</span>
                        <span className="mt-0.5 text-[9px] font-medium text-slate-400">{d.weekday}</span>
                      </div>
                    </th>
                  ))}
                  {SUMMARY_CODES.map((code, index) => (
                    <th
                      key={code}
                      className={cn(
                        CELL_BORDER,
                        "sticky z-20 bg-slate-100 px-0 py-2 text-center text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                      )}
                      style={{
                        right: `${(SUMMARY_CODES.length - 1 - index) * 2.5}rem`,
                        width: "2.5rem",
                        minWidth: "2.5rem",
                      }}
                    >
                      {code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.employeeId} className="group">
                    <td
                      className={cn(
                        CELL_BORDER,
                        "sticky left-0 z-20 bg-white px-3 py-2 dark:bg-slate-950",
                        "group-hover:bg-slate-50 dark:group-hover:bg-slate-900",
                      )}
                    >
                      <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-white">
                        {row.employeeName}
                      </p>
                      <p className="truncate text-[10px] text-slate-500">
                        {row.designation ?? row.department}
                      </p>
                    </td>
                    {row.days.map((day) => (
                      <DayCell key={day.day} code={day.code} title={day.title} />
                    ))}
                    {SUMMARY_CODES.map((code, index) => {
                      const value = row.totals[code];
                      const tone =
                        code === "P"
                          ? "text-[#2277FF]"
                          : code === "A"
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-slate-500";
                      return (
                        <td
                          key={code}
                          className={cn(
                            CELL_BORDER,
                            "sticky z-10 bg-slate-50 px-0 py-0 text-center text-xs font-bold tabular-nums dark:bg-slate-900",
                            tone,
                            "group-hover:bg-slate-100 dark:group-hover:bg-slate-800",
                          )}
                          style={{
                            right: `${(SUMMARY_CODES.length - 1 - index) * 2.5}rem`,
                            width: "2.5rem",
                            minWidth: "2.5rem",
                            height: "2.25rem",
                            lineHeight: "2.25rem",
                          }}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
