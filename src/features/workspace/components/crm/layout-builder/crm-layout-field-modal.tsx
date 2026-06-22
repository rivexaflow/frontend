"use client";

import { useEffect, useMemo, useState } from "react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import { CrmSettingsToggleRow } from "@/features/workspace/components/crm/crm-panel";
import { EnterpriseFormModal } from "@/features/workspace/components/enterprise/enterprise-form-modal";
import {
  CRM_LAYOUT_FIELD_TYPES,
  slugifyLayoutKey,
  type CrmLayoutField,
  type CrmLayoutFieldType,
  type CrmLayoutSection,
} from "@/features/workspace/data/crm-layout-demo";
import { cn } from "@/lib/utils/cn";

export type FieldFormValues = {
  label: string;
  key: string;
  type: CrmLayoutFieldType;
  sectionId: string;
  placeholder: string;
  helpText: string;
  required: boolean;
  width: "full" | "half";
  optionsText: string;
  showOnCreate: boolean;
  showOnEdit: boolean;
};

type Props = {
  open: boolean;
  title: string;
  sections: CrmLayoutSection[];
  initial: FieldFormValues;
  isSystem?: boolean;
  onClose: () => void;
  onSave: (values: FieldFormValues) => void;
};

export function CrmLayoutFieldModal({
  open,
  title,
  sections,
  initial,
  isSystem,
  onClose,
  onSave,
}: Props) {
  const [values, setValues] = useState(initial);
  const [keyTouched, setKeyTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initial);
      setKeyTouched(false);
    }
  }, [open, initial]);

  const showOptions = values.type === "select";

  const typeMeta = useMemo(
    () => CRM_LAYOUT_FIELD_TYPES.find((t) => t.value === values.type),
    [values.type],
  );

  return (
    <EnterpriseFormModal
      open={open}
      title={title}
      description="Configure how this field appears on lead create and edit forms."
      onClose={onClose}
      size="xl"
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!values.label.trim() || !values.sectionId) return;
          onSave({
            ...values,
            label: values.label.trim(),
            key: slugifyLayoutKey(values.key || values.label),
            placeholder: values.placeholder.trim(),
            helpText: values.helpText.trim(),
          });
          onClose();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold text-slate-600">Field label</span>
            <input
              required
              autoFocus
              value={values.label}
              onChange={(e) => {
                const label = e.target.value;
                setValues((v) => ({
                  ...v,
                  label,
                  key: keyTouched ? v.key : slugifyLayoutKey(label),
                }));
              }}
              placeholder="e.g. Annual revenue"
              className={cn(crm.input, "mt-1.5 w-full")}
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Field key</span>
            <input
              required
              value={values.key}
              disabled={isSystem}
              onChange={(e) => {
                setKeyTouched(true);
                setValues((v) => ({ ...v, key: slugifyLayoutKey(e.target.value) }));
              }}
              placeholder="annual_revenue"
              className={cn(crm.input, "mt-1.5 w-full font-mono text-xs", isSystem && "opacity-60")}
            />
            <p className="mt-1 text-[11px] text-slate-400">Used for API mapping and imports.</p>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Section</span>
            <select
              required
              value={values.sectionId}
              onChange={(e) => setValues((v) => ({ ...v, sectionId: e.target.value }))}
              className={cn(crm.input, "mt-1.5 w-full")}
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset>
          <legend className="text-xs font-semibold text-slate-600">Field type</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {CRM_LAYOUT_FIELD_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setValues((v) => ({ ...v, type: t.value }))}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left transition",
                  values.type === t.value
                    ? "border-[#191970] bg-[#191970]/5 ring-1 ring-[#191970]/20"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-700",
                )}
              >
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{t.label}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">{t.description}</p>
              </button>
            ))}
          </div>
          {typeMeta ? <p className="mt-2 text-xs text-slate-500">Selected: {typeMeta.label}</p> : null}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Placeholder</span>
            <input
              value={values.placeholder}
              onChange={(e) => setValues((v) => ({ ...v, placeholder: e.target.value }))}
              placeholder="Hint text inside the input"
              className={cn(crm.input, "mt-1.5 w-full")}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Help text</span>
            <input
              value={values.helpText}
              onChange={(e) => setValues((v) => ({ ...v, helpText: e.target.value }))}
              placeholder="Shown below the field"
              className={cn(crm.input, "mt-1.5 w-full")}
            />
          </label>
        </div>

        {showOptions ? (
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Dropdown options</span>
            <textarea
              required
              rows={4}
              value={values.optionsText}
              onChange={(e) => setValues((v) => ({ ...v, optionsText: e.target.value }))}
              placeholder={"One option per line\nInbound\nOutbound\nPartner"}
              className={cn(crm.input, "mt-1.5 w-full resize-none py-2 font-mono text-xs")}
            />
          </label>
        ) : null}

        <fieldset>
          <legend className="text-xs font-semibold text-slate-600">Width on form</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["half", "full"] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setValues((v) => ({ ...v, width: w }))}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                  values.width === w
                    ? "border-[#191970] bg-[#191970]/5 text-[#191970]"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700",
                )}
              >
                {w === "half" ? "Half width" : "Full width"}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="rounded-xl border border-slate-200/80 px-4 dark:border-slate-800">
          <CrmSettingsToggleRow
            label="Required field"
            hint="User must fill this before saving the lead."
            checked={values.required}
            onChange={(v) => setValues((prev) => ({ ...prev, required: v }))}
          />
          <CrmSettingsToggleRow
            label="Show on create form"
            checked={values.showOnCreate}
            onChange={(v) => setValues((prev) => ({ ...prev, showOnCreate: v }))}
          />
          <CrmSettingsToggleRow
            label="Show on edit form"
            checked={values.showOnEdit}
            onChange={(v) => setValues((prev) => ({ ...prev, showOnEdit: v }))}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button type="button" onClick={onClose} className={crm.btnSecondary}>
            Cancel
          </button>
          <button type="submit" className={crm.btnPrimary}>
            Save field
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}

export function fieldToFormValues(field: CrmLayoutField): FieldFormValues {
  return {
    label: field.label,
    key: field.key,
    type: field.type,
    sectionId: field.sectionId,
    placeholder: field.placeholder ?? "",
    helpText: field.helpText ?? "",
    required: field.required,
    width: field.width,
    optionsText: (field.options ?? []).join("\n"),
    showOnCreate: field.showOnCreate,
    showOnEdit: field.showOnEdit,
  };
}

export function formValuesToField(
  values: FieldFormValues,
  existing?: CrmLayoutField,
): Omit<CrmLayoutField, "id" | "order"> {
  const options = values.type === "select"
    ? values.optionsText
        .split("\n")
        .map((o) => o.trim())
        .filter(Boolean)
    : undefined;

  return {
    sectionId: values.sectionId,
    label: values.label,
    key: slugifyLayoutKey(values.key || values.label),
    type: values.type,
    required: values.required,
    placeholder: values.placeholder || undefined,
    helpText: values.helpText || undefined,
    width: values.width,
    options,
    showOnCreate: values.showOnCreate,
    showOnEdit: values.showOnEdit,
    isSystem: existing?.isSystem,
  };
}
