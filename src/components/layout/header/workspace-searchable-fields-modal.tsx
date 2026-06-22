"use client";

import { useEffect, useState } from "react";

import { AdminModal } from "@/features/super-admin/components/admin-modal";
import {
  SEARCHABLE_FIELD_OPTIONS,
  type SearchableFieldId,
  workspaceTopbarStore,
} from "@/stores/workspace-topbar.store";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function WorkspaceSearchableFieldsModal({ open, onClose }: Props) {
  const searchableFields = workspaceTopbarStore((s) => s.searchableFields);
  const setSearchableField = workspaceTopbarStore((s) => s.setSearchableField);
  const [draft, setDraft] = useState(searchableFields);

  useEffect(() => {
    if (open) setDraft(searchableFields);
  }, [open, searchableFields]);

  const toggle = (id: SearchableFieldId) => {
    setDraft((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onSave = () => {
    for (const field of SEARCHABLE_FIELD_OPTIONS) {
      setSearchableField(field.id, draft[field.id]);
    }
    onClose();
  };

  return (
    <AdminModal
      open={open}
      title="Searchable fields"
      description="Select which fields are included in quick search across CRM records."
      onClose={onClose}
      className="sm:max-w-md"
    >
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200/90">
        {SEARCHABLE_FIELD_OPTIONS.map((field) => (
          <li key={field.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-sm font-medium text-slate-800">{field.label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={draft[field.id]}
              onClick={() => toggle(field.id)}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition",
                draft[field.id] ? "bg-[#191970]" : "bg-slate-200",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                  draft[field.id] ? "left-[22px]" : "left-0.5",
                )}
              />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          className="rounded-xl bg-[#191970] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#050a1f]"
        >
          Save configuration
        </button>
      </div>
    </AdminModal>
  );
}
