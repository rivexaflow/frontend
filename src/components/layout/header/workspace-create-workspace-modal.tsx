"use client";

import { FormEvent, useState } from "react";

import { AdminModal } from "@/features/super-admin/components/admin-modal";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { uiStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function WorkspaceCreateWorkspaceModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [customDomain, setCustomDomain] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    window.setTimeout(() => {
      uiStore.getState().pushNotification(`Workspace “${name.trim()}” created successfully.`);
      setIsSubmitting(false);
      setName("");
      setCustomDomain(false);
      onClose();
    }, 500);
  };

  return (
    <AdminModal
      open={open}
      title="Create new workspace"
      description="Spin up a separate workspace for another team or business unit."
      onClose={onClose}
      className="sm:max-w-md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="workspace-name" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Name
          </label>
          <input
            id="workspace-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter workspace name"
            className={cn(crm.input, "w-full")}
            required
          />
        </div>

        <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-slate-50/60 px-4 py-3">
          <span className="text-sm font-medium text-slate-700">Custom domain enable</span>
          <button
            type="button"
            role="switch"
            aria-checked={customDomain}
            onClick={() => setCustomDomain((v) => !v)}
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition",
              customDomain ? "bg-[#191970]" : "bg-slate-200",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                customDomain ? "left-[22px]" : "left-0.5",
              )}
            />
          </button>
        </label>

        <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl bg-slate-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="rounded-xl bg-[#191970] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#050a1f] disabled:opacity-60"
          >
            {isSubmitting ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
