"use client";

import { useEffect, useState } from "react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import { CrmSettingsToggleRow } from "@/features/workspace/components/crm/crm-panel";
import { EnterpriseFormModal } from "@/features/workspace/components/enterprise/enterprise-form-modal";
import type { CrmLayoutSection } from "@/features/workspace/data/crm-layout-demo";
import { cn } from "@/lib/utils/cn";

export type SectionFormValues = {
  name: string;
  description: string;
  columns: 1 | 2;
  collapsedDefault: boolean;
};

type Props = {
  open: boolean;
  title: string;
  initial: SectionFormValues;
  onClose: () => void;
  onSave: (values: SectionFormValues) => void;
};

export function CrmLayoutSectionModal({ open, title, initial, onClose, onSave }: Props) {
  const [values, setValues] = useState(initial);

  useEffect(() => {
    if (open) setValues(initial);
  }, [open, initial]);

  return (
    <EnterpriseFormModal open={open} title={title} description="Group related fields on the lead create and edit forms." onClose={onClose} size="lg">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!values.name.trim()) return;
          onSave({ ...values, name: values.name.trim(), description: values.description.trim() });
          onClose();
        }}
      >
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Section name</span>
          <input
            required
            autoFocus
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            placeholder="e.g. Contact details"
            className={cn(crm.input, "mt-1.5 w-full")}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Description</span>
          <textarea
            rows={2}
            value={values.description}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            placeholder="Shown below the section title in the builder"
            className={cn(crm.input, "mt-1.5 min-h-[72px] w-full resize-none py-2")}
          />
        </label>

        <fieldset>
          <legend className="text-xs font-semibold text-slate-600">Column layout</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {([1, 2] as const).map((cols) => (
              <button
                key={cols}
                type="button"
                onClick={() => setValues((v) => ({ ...v, columns: cols }))}
                className={cn(
                  "rounded-xl border px-3 py-3 text-left transition",
                  values.columns === cols
                    ? "border-[#191970] bg-[#191970]/5 ring-1 ring-[#191970]/20"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-700",
                )}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{cols === 1 ? "Single column" : "Two columns"}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {cols === 1 ? "Full-width fields stacked vertically" : "Half-width fields side by side"}
                </p>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="rounded-xl border border-slate-200/80 px-4 dark:border-slate-800">
          <CrmSettingsToggleRow
            label="Collapsed by default"
            hint="Section starts collapsed on the lead form until expanded."
            checked={values.collapsedDefault}
            onChange={(v) => setValues((prev) => ({ ...prev, collapsedDefault: v }))}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button type="button" onClick={onClose} className={crm.btnSecondary}>
            Cancel
          </button>
          <button type="submit" className={crm.btnPrimary}>
            Save section
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}

export function sectionToFormValues(section: CrmLayoutSection): SectionFormValues {
  return {
    name: section.name,
    description: section.description ?? "",
    columns: section.columns,
    collapsedDefault: section.collapsedDefault ?? false,
  };
}
