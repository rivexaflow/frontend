"use client";

type Props = {
  showing: number;
  total: number;
  label?: string;
};

export function CrmListSummary({ showing, total, label = "records" }: Props) {
  return (
    <p className="text-xs font-medium text-slate-500">
      Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{showing}</span> of{" "}
      <span className="font-semibold text-slate-700 dark:text-slate-300">{total}</span> {label}
    </p>
  );
}
