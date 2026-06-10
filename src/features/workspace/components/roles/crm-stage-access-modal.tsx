"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";

import {
  CRM_PIPELINE_STAGES,
  type CrmStageAccess,
} from "@/features/workspace/data/workspace-permissions-catalog";
import type { StageAccessRule } from "@/features/workspace/data/workspace-roles-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  stageAccess: Record<string, StageAccessRule>;
  onClose: () => void;
  onApply: (next: Record<string, StageAccessRule>) => void;
};

type ColumnKey = keyof StageAccessRule;

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "view", label: "View" },
  { key: "move", label: "Move" },
  { key: "edit", label: "Edit" },
];

function cloneAccess(access: Record<string, StageAccessRule>) {
  return Object.fromEntries(
    Object.entries(access).map(([id, rule]) => [id, { ...rule }]),
  ) as Record<string, StageAccessRule>;
}

function CellCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "mx-auto flex h-4 w-4 items-center justify-center rounded border transition",
        checked
          ? "border-[#191970] bg-[#191970] text-white"
          : "border-slate-300 bg-white hover:border-slate-400 dark:border-slate-600 dark:bg-slate-900",
      )}
    >
      {checked ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
    </button>
  );
}

export function CrmStageAccessModal({ open, stageAccess, onClose, onApply }: Props) {
  const [draft, setDraft] = useState<Record<string, StageAccessRule>>({});

  useEffect(() => {
    if (open) setDraft(cloneAccess(stageAccess));
  }, [open, stageAccess]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const groups = useMemo(
    () =>
      CRM_PIPELINE_STAGES.reduce<Record<string, CrmStageAccess[]>>((acc, stage) => {
        if (!acc[stage.group]) acc[stage.group] = [];
        acc[stage.group].push(stage);
        return acc;
      }, {}),
    [],
  );

  const configuredCount = CRM_PIPELINE_STAGES.filter((s) => {
    const r = draft[s.id];
    return r?.view || r?.move || r?.edit;
  }).length;

  if (!open) return null;

  const patch = (stageId: string, patchRule: Partial<StageAccessRule>) => {
    const current = draft[stageId] ?? { view: false, move: false, edit: false };
    setDraft({ ...draft, [stageId]: { ...current, ...patchRule } });
  };

  const setColumn = (column: ColumnKey, value: boolean) => {
    const next = { ...draft };
    for (const stage of CRM_PIPELINE_STAGES) {
      const current = next[stage.id] ?? { view: false, move: false, edit: false };
      next[stage.id] = { ...current, [column]: value };
    }
    setDraft(next);
  };

  const setAll = (rule: StageAccessRule) => {
    const next = { ...draft };
    for (const stage of CRM_PIPELINE_STAGES) {
      next[stage.id] = { ...rule };
    }
    setDraft(next);
  };

  const columnAllChecked = (column: ColumnKey) =>
    CRM_PIPELINE_STAGES.every((s) => (draft[s.id] ?? { view: false, move: false, edit: false })[column]);

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pipeline-stage-modal-title"
        className="relative z-[1] flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:rounded-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 id="pipeline-stage-modal-title" className="text-base font-semibold text-slate-900 dark:text-white">
              Pipeline stage access
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {configuredCount} of {CRM_PIPELINE_STAGES.length} stages configured
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-2.5 dark:border-slate-800">
          <span className="text-xs text-slate-400">Apply to all stages:</span>
          <div className="inline-flex rounded-md border border-slate-200 p-0.5 dark:border-slate-700">
            {(
              [
                { label: "None", rule: { view: false, move: false, edit: false } },
                { label: "View", rule: { view: true, move: false, edit: false } },
                { label: "Full", rule: { view: true, move: true, edit: true } },
              ] as const
            ).map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setAll(preset.rule)}
                className="rounded px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950">
              <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800">
                <th className="px-5 py-2.5 font-semibold">Stage</th>
                {COLUMNS.map((col) => (
                  <th key={col.key} className="w-16 px-2 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => setColumn(col.key, !columnAllChecked(col.key))}
                      className="inline-flex flex-col items-center gap-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 transition hover:text-[#191970]"
                      title={`Toggle ${col.label} for all stages`}
                    >
                      {col.label}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groups).map(([group, stages]) => (
                <Fragment key={group}>
                  <tr className="bg-slate-50/80 dark:bg-slate-950/60">
                    <td colSpan={4} className="px-5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {group}
                    </td>
                  </tr>
                  {stages.map((stage) => {
                    const rule = draft[stage.id] ?? { view: false, move: false, edit: false };
                    return (
                      <tr
                        key={stage.id}
                        className="border-b border-slate-100 dark:border-slate-800/80"
                      >
                        <td className="px-5 py-2 text-slate-800 dark:text-slate-200">{stage.label}</td>
                        {COLUMNS.map((col) => (
                          <td key={col.key} className="px-2 py-2 text-center">
                            <CellCheckbox
                              checked={rule[col.key]}
                              onChange={(v) => patch(stage.id, { [col.key]: v })}
                              label={`${col.label} — ${stage.label}`}
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            className="h-9 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white transition hover:bg-[#12124a]"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
