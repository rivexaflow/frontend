"use client";

import { Eye } from "lucide-react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import type { CrmLayoutField, CrmLayoutSection } from "@/features/workspace/data/crm-layout-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  sections: CrmLayoutSection[];
  fields: CrmLayoutField[];
  mode?: "create" | "edit";
};

function PreviewField({ field }: { field: CrmLayoutField }) {
  const label = (
    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
      {field.label}
      {field.required ? <span className="ml-0.5 text-rose-500">*</span> : null}
    </span>
  );

  const control = (() => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            readOnly
            rows={3}
            placeholder={field.placeholder}
            className={cn(crm.input, "mt-1.5 w-full resize-none py-2 opacity-80")}
          />
        );
      case "select":
        return (
          <select disabled className={cn(crm.input, "mt-1.5 w-full opacity-80")}>
            <option>{field.placeholder ?? `Select ${field.label.toLowerCase()}…`}</option>
            {(field.options ?? []).slice(0, 3).map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <label className="mt-2 flex items-center gap-2">
            <input type="checkbox" disabled className="h-4 w-4 rounded border-slate-300" />
            <span className="text-sm text-slate-600">{field.placeholder ?? field.label}</span>
          </label>
        );
      default:
        return (
          <input
            readOnly
            type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
            placeholder={field.placeholder}
            className={cn(crm.input, "mt-1.5 w-full opacity-80")}
          />
        );
    }
  })();

  return (
    <div className={cn(field.width === "half" ? "sm:col-span-1" : "sm:col-span-2")}>
      {field.type !== "checkbox" ? label : null}
      {control}
      {field.helpText ? <p className="mt-1 text-[11px] text-slate-400">{field.helpText}</p> : null}
    </div>
  );
}

export function CrmLayoutPreview({ sections, fields, mode = "create" }: Props) {
  const visibleFields = fields.filter((f) => (mode === "create" ? f.showOnCreate : f.showOnEdit));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-gradient-to-r from-[#191970]/[0.04] to-transparent px-4 py-3 dark:border-slate-800">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#191970]/10 text-[#191970]">
          <Eye className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Live preview</p>
          <p className="text-xs text-slate-500">{mode === "create" ? "Create lead form" : "Edit lead form"}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-lg rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">New lead</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Capture prospect</h3>
          </div>

          <div className="space-y-5">
            {sections.map((section) => {
              const sectionFields = visibleFields
                .filter((f) => f.sectionId === section.id)
                .sort((a, b) => a.order - b.order);

              if (sectionFields.length === 0) return null;

              return (
                <section key={section.id}>
                  <div className="mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#191970]">{section.name}</h4>
                    {section.description ? (
                      <p className="mt-0.5 text-[11px] text-slate-500">{section.description}</p>
                    ) : null}
                  </div>
                  <div
                    className={cn(
                      "grid gap-3",
                      section.columns === 2 ? "sm:grid-cols-2" : "grid-cols-1",
                    )}
                  >
                    {sectionFields.map((field) => (
                      <PreviewField key={field.id} field={field} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button type="button" className={crm.btnSecondarySm} disabled>
              Cancel
            </button>
            <button type="button" className={crm.btnPrimarySm} disabled>
              Create lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
