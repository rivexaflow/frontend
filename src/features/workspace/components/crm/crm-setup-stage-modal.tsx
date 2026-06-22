"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type StageModalValues = {
  name: string;
  autoTask: boolean;
  autoReminder: boolean;
  targetDepartment: string;
};

type Props = {
  open: boolean;
  title: string;
  initial: StageModalValues;
  onClose: () => void;
  onSave: (values: StageModalValues) => void;
};

const inputClass =
  "mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/15 dark:border-slate-700 dark:bg-slate-950";

export function CrmSetupStageModal({ open, title, initial, onClose, onSave }: Props) {
  const [values, setValues] = useState(initial);

  useEffect(() => {
    if (open) setValues(initial);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-[1] w-full max-w-lg overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="max-h-[70vh] overflow-y-auto px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(values);
            onClose();
          }}
        >
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Stage name</span>
            <input
              required
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              className={inputClass}
              placeholder="e.g. Qualified"
            />
          </label>

          <fieldset className="mt-5 rounded-lg border border-slate-100 p-4 dark:border-slate-800">
            <legend className="px-1 text-xs font-bold uppercase tracking-wider text-slate-400">Automation on entry</legend>
            <label className="mt-3 block">
              <span className="text-xs font-semibold text-slate-600">Route to department</span>
              <select
                value={values.targetDepartment}
                onChange={(e) => setValues((v) => ({ ...v, targetDepartment: e.target.value }))}
                className={inputClass}
              >
                <option value="">No automatic routing</option>
                <option value="sales">Sales</option>
                <option value="operations">Operations</option>
                <option value="support">Support</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-500">Lead moves to this department when entering the stage.</p>
            </label>

            <ToggleRow
              label="Auto-create follow-up task"
              description="Creates a task for the assignee when a record enters this stage."
              checked={values.autoTask}
              onChange={(autoTask) => setValues((v) => ({ ...v, autoTask }))}
            />
            <ToggleRow
              label="Auto-create reminder"
              description="Schedules a reminder notification for the owner."
              checked={values.autoReminder}
              onChange={(autoReminder) => setValues((v) => ({ ...v, autoReminder }))}
            />
          </fieldset>

          <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#191970] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12124a]"
            >
              Save stage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="mt-4 flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
        <p className="text-[11px] text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-[#191970]" : "bg-slate-200 dark:bg-slate-700",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}
