"use client";

import { useEffect, useState } from "react";
import {
  Bookmark,
  Building2,
  Check,
  GitBranch,
  Link2,
  Search,
  Sparkles,
  Tag,
  UserRound,
} from "lucide-react";

import { AdminModal } from "@/features/super-admin/components/admin-modal";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { LEAD_BOARD_STAGES } from "@/features/workspace/data/crm-demo";
import {
  EMPTY_ADVANCED_FILTERS,
  type AdvancedLeadFilters,
  workspaceTopbarStore,
} from "@/stores/workspace-topbar.store";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
};

function SectionCard({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  accent: "brand" | "sky" | "emerald" | "amber";
  children: React.ReactNode;
}) {
  const accentBar = {
    brand: "border-l-[#2277FF]",
    sky: "border-l-sky-500",
    emerald: "border-l-emerald-500",
    amber: "border-l-amber-500",
  }[accent];

  const iconTone = {
    brand: "bg-[#191970]/10 text-[#191970]",
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  }[accent];

  return (
    <section className={cn("rounded-xl border border-slate-200/90 border-l-[3px] bg-white p-4", accentBar)}>
      <div className="mb-3 flex items-center gap-2">
        <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-lg", iconTone)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-semibold text-slate-600">{children}</label>;
}

function DateRangeRow({
  label,
  from,
  to,
  onFrom,
  onTo,
}: {
  label: string;
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <input type="date" value={from} onChange={(e) => onFrom(e.target.value)} className={cn(crm.inputSm, "w-full")} />
        <span className="text-slate-400">→</span>
        <input type="date" value={to} onChange={(e) => onTo(e.target.value)} className={cn(crm.inputSm, "w-full")} />
      </div>
    </div>
  );
}

export function WorkspaceAdvancedFiltersModal({ open, onClose }: Props) {
  const setAdvancedFilters = workspaceTopbarStore((s) => s.setAdvancedFilters);
  const clearAdvancedFilters = workspaceTopbarStore((s) => s.clearAdvancedFilters);
  const [draft, setDraft] = useState<AdvancedLeadFilters>(EMPTY_ADVANCED_FILTERS);

  useEffect(() => {
    if (open) {
      setDraft(workspaceTopbarStore.getState().advancedFilters);
    }
  }, [open]);

  const set = <K extends keyof AdvancedLeadFilters>(key: K, value: AdvancedLeadFilters[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const onApply = () => {
    setAdvancedFilters(draft);
    onClose();
  };

  const onClear = () => {
    clearAdvancedFilters();
    setDraft(EMPTY_ADVANCED_FILTERS);
  };

  return (
    <AdminModal
      open={open}
      title="Advanced lead filters"
      description="Refine your lead list with specific criteria."
      onClose={onClose}
      className="sm:max-w-2xl"
    >
      <div className="space-y-4">
        <div>
          <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2277FF]">
            <UserRound className="h-3.5 w-3.5" />
            Lead assignment & timing
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel>Responsible person</FieldLabel>
              <select value={draft.responsiblePerson} onChange={(e) => set("responsiblePerson", e.target.value)} className={cn(crm.select, "w-full")}>
                <option value="">Please select</option>
                <option value="Priya Singh">Priya Singh</option>
                <option value="James Okon">James Okon</option>
                <option value="Elena Rossi">Elena Rossi</option>
              </select>
            </div>
            <div>
              <FieldLabel>Lead stage</FieldLabel>
              <select value={draft.leadStage} onChange={(e) => set("leadStage", e.target.value)} className={cn(crm.select, "w-full")}>
                <option value="">Please select</option>
                {LEAD_BOARD_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <DateRangeRow label="Date created range" from={draft.createdFrom} to={draft.createdTo} onFrom={(v) => set("createdFrom", v)} onTo={(v) => set("createdTo", v)} />
            <DateRangeRow label="Date modified range" from={draft.modifiedFrom} to={draft.modifiedTo} onFrom={(v) => set("modifiedFrom", v)} onTo={(v) => set("modifiedTo", v)} />
          </div>
        </div>

        <SectionCard icon={Building2} title="Department" accent="brand">
          <select value={draft.department} onChange={(e) => set("department", e.target.value)} className={cn(crm.select, "w-full")}>
            <option value="">Please select</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
          </select>
        </SectionCard>

        <SectionCard icon={GitBranch} title="Team" accent="sky">
          <select value={draft.team} onChange={(e) => set("team", e.target.value)} className={cn(crm.select, "w-full")}>
            <option value="">Please select</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Mid-market">Mid-market</option>
            <option value="Inbound">Inbound</option>
          </select>
        </SectionCard>

        <SectionCard icon={Tag} title="Classification" accent="emerald">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <FieldLabel>Source</FieldLabel>
              <select value={draft.source} onChange={(e) => set("source", e.target.value)} className={cn(crm.select, "w-full")}>
                <option value="">Please select</option>
                <option value="Inbound">Inbound</option>
                <option value="Outbound">Outbound</option>
                <option value="Partner">Partner</option>
                <option value="Referral">Referral</option>
                <option value="Webinar">Webinar</option>
              </select>
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200/90 bg-slate-50/80 px-3 py-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={draft.showDuplicates}
                onChange={(e) => set("showDuplicates", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#191970]"
              />
              Show duplicate leads
            </label>
          </div>
        </SectionCard>

        <div>
          <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-600">
            <Link2 className="h-3.5 w-3.5" />
            Audit information
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel>Created by</FieldLabel>
              <select value={draft.createdBy} onChange={(e) => set("createdBy", e.target.value)} className={cn(crm.select, "w-full")}>
                <option value="">Please select</option>
                <option value="system">System</option>
                <option value="import">Bulk import</option>
              </select>
            </div>
            <div>
              <FieldLabel>Modified by</FieldLabel>
              <select value={draft.modifiedBy} onChange={(e) => set("modifiedBy", e.target.value)} className={cn(crm.select, "w-full")}>
                <option value="">Please select</option>
                <option value="Priya Singh">Priya Singh</option>
                <option value="James Okon">James Okon</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-600">
            <Sparkles className="h-3.5 w-3.5" />
            Custom fields
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["clientCode", "Client code", "Search client code…"],
                ["segment", "Segment", "Search segment…"],
                ["activationDate", "Activation date", "Search activation date…"],
                ["additionalNumber", "Additional number", "Search additional number…"],
              ] as const
            ).map(([key, label, placeholder]) => (
              <div key={key}>
                <FieldLabel>{label}</FieldLabel>
                <input
                  type="text"
                  value={draft[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={placeholder}
                  className={cn(crm.inputSm, "w-full")}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3">
          <p className="text-xs font-semibold text-slate-700">Quick load saved filter</p>
          <p className="mt-1 text-xs text-slate-500">No saved filters yet.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Search className="h-4 w-4" />
          Clear all
        </button>
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#191970]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#191970] transition hover:bg-[#191970]/5"
          >
            <Bookmark className="h-4 w-4" />
            Save preset
          </button>
          <button
            type="button"
            onClick={onApply}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#191970] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#050a1f]"
          >
            <Check className="h-4 w-4" />
            Apply filters
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
