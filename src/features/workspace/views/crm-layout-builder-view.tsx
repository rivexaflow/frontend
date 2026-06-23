"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";

import {
  CrmLayoutFieldModal,
  fieldToFormValues,
  formValuesToField,
  type FieldFormValues,
} from "@/features/workspace/components/crm/layout-builder/crm-layout-field-modal";
import { CrmLayoutPreview } from "@/features/workspace/components/crm/layout-builder/crm-layout-preview";
import {
  CrmLayoutSectionModal,
  sectionToFormValues,
  type SectionFormValues,
} from "@/features/workspace/components/crm/layout-builder/crm-layout-section-modal";
import { CrmShell } from "@/features/workspace/components/crm/crm-panel";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { CrmDragHandle, CrmGhostButton, CrmPrimaryButton, CrmRowActions } from "@/features/workspace/components/crm/crm-ui-primitives";
import { CrmPageHeader } from "@/features/workspace/components/crm/crm-workspace-header";
import {
  createFieldId,
  createSectionId,
  DEMO_CRM_LAYOUT_FIELDS,
  DEMO_CRM_LAYOUT_SECTIONS,
  type CrmLayoutField,
  type CrmLayoutSection,
} from "@/features/workspace/data/crm-layout-demo";
import { cn } from "@/lib/utils/cn";

type SectionEditTarget = { mode: "create" } | { mode: "edit"; id: string } | null;
type FieldEditTarget = { mode: "create"; sectionId?: string } | { mode: "edit"; id: string } | null;

const EMPTY_SECTION: SectionFormValues = {
  name: "",
  description: "",
  columns: 2,
  collapsedDefault: false,
};

const EMPTY_FIELD: FieldFormValues = {
  label: "",
  key: "",
  type: "text",
  sectionId: "",
  placeholder: "",
  helpText: "",
  required: false,
  width: "half",
  optionsText: "",
  showOnCreate: true,
  showOnEdit: true,
};

const FIELD_TYPE_LABEL: Record<CrmLayoutField["type"], string> = {
  text: "Text",
  email: "Email",
  tel: "Phone",
  number: "Number",
  textarea: "Long text",
  select: "Dropdown",
  date: "Date",
  checkbox: "Checkbox",
  url: "URL",
};

export function CrmLayoutBuilderView() {
  const [sections, setSections] = useState<CrmLayoutSection[]>(DEMO_CRM_LAYOUT_SECTIONS);
  const [fields, setFields] = useState<CrmLayoutField[]>(DEMO_CRM_LAYOUT_FIELDS);
  const [previewMode, setPreviewMode] = useState<"create" | "edit">("create");
  const [sectionEdit, setSectionEdit] = useState<SectionEditTarget>(null);
  const [fieldEdit, setFieldEdit] = useState<FieldEditTarget>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.order - b.order),
    [sections],
  );

  const fieldsBySection = useMemo(() => {
    const map = new Map<string, CrmLayoutField[]>();
    fields.forEach((f) => {
      const list = map.get(f.sectionId) ?? [];
      list.push(f);
      map.set(f.sectionId, list);
    });
    map.forEach((list, key) => {
      map.set(
        key,
        [...list].sort((a, b) => a.order - b.order),
      );
    });
    return map;
  }, [fields]);

  const editingSection =
    sectionEdit?.mode === "edit" ? sections.find((s) => s.id === sectionEdit.id) : null;

  const editingField = fieldEdit?.mode === "edit" ? fields.find((f) => f.id === fieldEdit.id) : null;

  const sectionModalInitial =
    sectionEdit?.mode === "edit" && editingSection
      ? sectionToFormValues(editingSection)
      : EMPTY_SECTION;

  const fieldModalInitial: FieldFormValues =
    fieldEdit?.mode === "edit" && editingField
      ? fieldToFormValues(editingField)
      : {
          ...EMPTY_FIELD,
          sectionId: fieldEdit?.mode === "create" ? (fieldEdit.sectionId ?? sortedSections[0]?.id ?? "") : sortedSections[0]?.id ?? "",
        };

  const saveSection = (values: SectionFormValues) => {
    if (sectionEdit?.mode === "edit" && editingSection) {
      setSections((prev) =>
        prev.map((s) =>
          s.id === editingSection.id
            ? { ...s, name: values.name, description: values.description || undefined, columns: values.columns, collapsedDefault: values.collapsedDefault }
            : s,
        ),
      );
    } else {
      const id = createSectionId();
      setSections((prev) => [
        ...prev,
        {
          id,
          name: values.name,
          description: values.description || undefined,
          columns: values.columns,
          collapsedDefault: values.collapsedDefault,
          order: prev.length + 1,
        },
      ]);
    }
  };

  const deleteSection = (id: string) => {
    const sectionFields = fields.filter((f) => f.sectionId === id);
    if (sectionFields.some((f) => f.isSystem)) return;
    setSections((prev) => prev.filter((s) => s.id !== id));
    setFields((prev) => prev.filter((f) => f.sectionId !== id));
  };

  const saveField = (values: FieldFormValues) => {
    const payload = formValuesToField(values, editingField ?? undefined);

    if (fieldEdit?.mode === "edit" && editingField) {
      setFields((prev) =>
        prev.map((f) => (f.id === editingField.id ? { ...f, ...payload } : f)),
      );
    } else {
      const sectionFields = fields.filter((f) => f.sectionId === values.sectionId);
      setFields((prev) => [
        ...prev,
        {
          id: createFieldId(),
          order: sectionFields.length + 1,
          ...payload,
        },
      ]);
    }
  };

  const deleteField = (id: string) => {
    const field = fields.find((f) => f.id === id);
    if (field?.isSystem) return;
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleRequired = (id: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, required: !f.required } : f)));
  };

  const publishLayout = () => {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  };

  return (
    <div className="pb-8">
      <CrmPageHeader
        eyebrow="CRM · Settings"
        title="Form builder"
        description="Design the create and edit forms your team uses when capturing leads — sections, field types, and validation."
        metrics={[
          { label: "Sections", value: sections.length },
          { label: "Fields", value: fields.length },
          { label: "Required", value: fields.filter((f) => f.required).length },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <CrmGhostButton onClick={() => setSectionEdit({ mode: "create" })}>
              <Plus className="h-3.5 w-3.5" />
              New section
            </CrmGhostButton>
            <CrmPrimaryButton onClick={() => setFieldEdit({ mode: "create" })}>
              <Plus className="h-3.5 w-3.5" />
              New field
            </CrmPrimaryButton>
            <button type="button" onClick={publishLayout} className={cn(crm.btnPrimary, savedFlash && "bg-emerald-700 hover:bg-emerald-800")}>
              <Save className="h-3.5 w-3.5" />
              {savedFlash ? "Published" : "Publish layout"}
            </button>
          </div>
        }
      />

      <CrmShell className="grid min-h-[640px] lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        {/* Builder canvas */}
        <div className="border-b border-slate-100 lg:border-b-0 lg:border-r dark:border-slate-800">
          <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/25">
            <p className={crm.sectionLabel}>Form structure</p>
            <p className="mt-1 text-xs text-slate-500">Drag fields to reorder · click edit to configure validation and visibility.</p>
          </div>

          <div className="space-y-3 p-4">
            {sortedSections.map((section) => {
              const sectionFields = fieldsBySection.get(section.id) ?? [];
              const canDeleteSection = !sectionFields.some((f) => f.isSystem);

              return (
                <div
                  key={section.id}
                  className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/20"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-[#191970]/[0.03] to-transparent px-4 py-3 dark:border-slate-800">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{section.name}</h3>
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-800">
                          {section.columns === 2 ? "2 col" : "1 col"}
                        </span>
                        {section.collapsedDefault ? (
                          <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">Collapsed</span>
                        ) : null}
                      </div>
                      {section.description ? (
                        <p className="mt-0.5 text-xs text-slate-500">{section.description}</p>
                      ) : null}
                    </div>
                    <CrmRowActions
                      onEdit={() => setSectionEdit({ mode: "edit", id: section.id })}
                      onDelete={canDeleteSection ? () => deleteSection(section.id) : undefined}
                    />
                  </div>

                  <div className="p-3">
                    <div
                      className={cn(
                        "grid gap-2",
                        section.columns === 2 ? "sm:grid-cols-2" : "grid-cols-1",
                      )}
                    >
                      {sectionFields.map((field) => (
                        <div
                          key={field.id}
                          className={cn(
                            "group flex items-center gap-2 rounded-lg border border-slate-200/90 bg-slate-50/40 px-2.5 py-2 transition hover:border-[#191970]/30 hover:bg-white dark:border-slate-800",
                            field.width === "full" && section.columns === 2 && "sm:col-span-2",
                          )}
                        >
                          <CrmDragHandle />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{field.label}</p>
                              {field.isSystem ? (
                                <span className="rounded bg-slate-200/80 px-1 py-0.5 text-[9px] font-bold uppercase text-slate-500">System</span>
                              ) : null}
                            </div>
                            <p className="text-[10px] text-slate-400">
                              {FIELD_TYPE_LABEL[field.type]} · <span className="font-mono">{field.key}</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleRequired(field.id)}
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                              field.required ? "bg-[#191970] text-white" : "bg-slate-200 text-slate-500",
                            )}
                          >
                            {field.required ? "Req" : "Opt"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setFieldEdit({ mode: "edit", id: field.id })}
                            className="rounded-lg p-1.5 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-[#191970]/10 hover:text-[#191970]"
                            aria-label="Edit field"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {!field.isSystem ? (
                            <button
                              type="button"
                              onClick={() => deleteField(field.id)}
                              className="rounded-lg p-1.5 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600"
                              aria-label="Delete field"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => setFieldEdit({ mode: "create", sectionId: section.id })}
                        className={cn(
                          "flex min-h-[48px] items-center justify-center rounded-lg border border-dashed border-slate-200 text-xs font-medium text-slate-400 transition hover:border-[#191970] hover:text-[#191970] dark:border-slate-700",
                          section.columns === 2 && "sm:col-span-2",
                        )}
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Add field to {section.name}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setSectionEdit({ mode: "create" })}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-4 text-sm font-medium text-slate-500 transition hover:border-[#191970] hover:text-[#191970] dark:border-slate-700"
            >
              <Plus className="h-4 w-4" />
              Add new section
            </button>
          </div>
        </div>

        {/* Live preview */}
        <div className="flex flex-col bg-slate-50/30 dark:bg-slate-950/20">
          <div className="flex border-b border-slate-100 px-4 py-2 dark:border-slate-800">
            <div className="inline-flex rounded-lg border border-slate-200/90 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900">
              {(["create", "edit"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPreviewMode(m)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition",
                    previewMode === m ? "bg-[#191970] text-white" : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  {m} form
                </button>
              ))}
            </div>
          </div>
          <CrmLayoutPreview sections={sortedSections} fields={fields} mode={previewMode} />
        </div>
      </CrmShell>

      <CrmLayoutSectionModal
        open={!!sectionEdit}
        title={sectionEdit?.mode === "edit" ? "Edit section" : "Add section"}
        initial={sectionModalInitial}
        onClose={() => setSectionEdit(null)}
        onSave={saveSection}
      />

      <CrmLayoutFieldModal
        open={!!fieldEdit}
        title={fieldEdit?.mode === "edit" ? "Edit field" : "Add field"}
        sections={sortedSections}
        initial={fieldModalInitial}
        isSystem={editingField?.isSystem}
        onClose={() => setFieldEdit(null)}
        onSave={saveField}
      />
    </div>
  );
}
