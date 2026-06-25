"use client";

import { useState } from "react";
import { Plus, RotateCcw, Save } from "lucide-react";

import {
  CrmSetupStageModal,
  type StageModalValues,
} from "@/features/workspace/components/crm/crm-setup-stage-modal";
import {
  CrmSettingsRow,
  CrmSettingsToggleRow,
} from "@/features/workspace/components/crm/crm-panel";
import {
  CrmSetupHint,
  CrmSetupShell,
  CrmSetupTable,
} from "@/features/workspace/components/crm/crm-setup-shell";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { CrmDragHandle, CrmPrimaryButton, CrmRowActions } from "@/features/workspace/components/crm/crm-ui-primitives";
import { CrmPageHeader } from "@/features/workspace/components/crm/crm-workspace-header";
import { cn } from "@/lib/utils/cn";
import type { CrmSetupSection } from "@/features/workspace/data/crm-nav";
import {
  DEFAULT_CRM_GENERAL_SETTINGS,
  DEMO_CRM_DEAL_STAGES,
  DEMO_CRM_DEAL_TYPES,
  DEMO_CRM_LABELS,
  DEMO_CRM_LEAD_STAGES,
  DEMO_CRM_LOST_REASONS,
  DEMO_CRM_SOURCES,
  STAGE_KIND_LABEL,
  STAGE_KIND_TONE,
  type CrmDealStageConfig,
  type CrmLeadStageConfig,
  type CrmPicklistItem,
} from "@/features/workspace/data/crm-setup-demo";

type StageEditTarget =
  | { type: "lead"; id: string }
  | { type: "deal"; id: string }
  | null;

export function CrmSetupView() {
  const [section, setSection] = useState<CrmSetupSection>("lead_stages");
  const [leadStages, setLeadStages] = useState(DEMO_CRM_LEAD_STAGES);
  const [dealStages, setDealStages] = useState(DEMO_CRM_DEAL_STAGES);
  const [sources, setSources] = useState(DEMO_CRM_SOURCES);
  const [lostReasons, setLostReasons] = useState(DEMO_CRM_LOST_REASONS);
  const [dealTypes, setDealTypes] = useState(DEMO_CRM_DEAL_TYPES);
  const [editTarget, setEditTarget] = useState<StageEditTarget>(null);
  const [settings, setSettings] = useState(DEFAULT_CRM_GENERAL_SETTINGS);

  const editingStage = editTarget
    ? editTarget.type === "lead"
      ? leadStages.find((s) => s.id === editTarget.id)
      : dealStages.find((s) => s.id === editTarget.id)
    : null;

  const modalInitial: StageModalValues = {
    name: editingStage?.name ?? "",
    autoTask: false,
    autoReminder: false,
    targetDepartment: "",
  };

  const saveStage = (values: StageModalValues) => {
    if (!editTarget) return;
    if (editTarget.type === "lead") {
      setLeadStages((prev) => prev.map((s) => (s.id === editTarget.id ? { ...s, name: values.name } : s)));
    } else {
      setDealStages((prev) => prev.map((s) => (s.id === editTarget.id ? { ...s, name: values.name } : s)));
    }
  };

  const removeLeadStage = (id: string) => setLeadStages((prev) => prev.filter((s) => s.id !== id));
  const removeDealStage = (id: string) => setDealStages((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="pb-4">
      <CrmPageHeader
        metrics={[
          { label: "Lead stages", value: leadStages.length },
          { label: "Deal stages", value: dealStages.length },
          { label: "Sources", value: sources.filter((s) => s.active).length },
        ]}
      />

      <CrmSetupShell
        section={section}
        onSectionChange={setSection}
        actions={
          section === "lead_stages" || section === "deal_stages" ? (
            <CrmPrimaryButton>
              <Plus className="h-3.5 w-3.5" />
              Add stage
            </CrmPrimaryButton>
          ) : section === "sources" || section === "lost_reasons" || section === "deal_types" ? (
            <CrmPrimaryButton>
              <Plus className="h-3.5 w-3.5" />
              Add item
            </CrmPrimaryButton>
          ) : null
        }
      >
        {section === "lead_stages" ? (
          <>
            <CrmSetupHint>
              Stages power the leads board. Use outcome-based names your team can verify. Drag to reorder — first
              stage is fixed; final stages mark qualified or closed-out.
            </CrmSetupHint>
            <StageTable
              stages={leadStages}
              onEdit={(id) => setEditTarget({ type: "lead", id })}
              onDelete={removeLeadStage}
            />
          </>
        ) : null}

        {section === "deal_stages" ? (
          <>
            <CrmSetupHint>
              Deal stages drive forecasting. Set win probability on open stages (10 → 25 → 50 → 75). Won = 100%,
              lost = 0%.
            </CrmSetupHint>
            <DealStageTable
              stages={dealStages}
              onEdit={(id) => setEditTarget({ type: "deal", id })}
              onDelete={removeDealStage}
            />
          </>
        ) : null}

        {section === "lost_reasons" ? (
          <>
            <CrmSetupHint>Required when marking a deal lost — powers loss analysis and coaching.</CrmSetupHint>
            <PicklistTable items={lostReasons} onDelete={(id) => setLostReasons((p) => p.filter((x) => x.id !== id))} />
          </>
        ) : null}

        {section === "sources" ? (
          <>
            <CrmSetupHint>Align with marketing channels for accurate source ROI. Disable instead of delete.</CrmSetupHint>
            <PicklistTable items={sources} showDescription onDelete={(id) => setSources((p) => p.filter((x) => x.id !== id))} />
          </>
        ) : null}

        {section === "deal_types" ? (
          <>
            <CrmSetupHint>Separate new business, renewals, and expansions for routing and quota reports.</CrmSetupHint>
            <PicklistTable items={dealTypes} onDelete={(id) => setDealTypes((p) => p.filter((x) => x.id !== id))} />
          </>
        ) : null}

        {section === "labels" ? (
          <>
            <CrmSetupHint>Shared tags across leads, deals, and tasks — filter without custom fields.</CrmSetupHint>
            <div className="flex flex-wrap gap-2">
              {DEMO_CRM_LABELS.map((label) => (
                <span
                  key={label.id}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: label.color }} />
                  {label.name}
                </span>
              ))}
            </div>
          </>
        ) : null}

        {section === "general" ? (
          <>
            <CrmSetupHint>Workspace defaults for new leads and deals. Keep required fields minimal.</CrmSetupHint>
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/20">
              <div className="border-b border-slate-100 px-5 py-3 dark:border-slate-800">
                <p className={crm.sectionLabel}>Assignment</p>
              </div>
              <div className="px-5">
                <CrmSettingsRow
                  label="Default owner for new leads"
                  hint="Applied when no owner is specified on create or import."
                >
                  <input
                    readOnly
                    value={settings.defaultOwner}
                    className={cn(crm.input, "w-full")}
                  />
                </CrmSettingsRow>
                <CrmSettingsRow
                  label="Assignment method"
                  hint="Round robin distributes across the active sales team."
                >
                  <select
                    value={settings.assignmentMethod}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        assignmentMethod: e.target.value as typeof s.assignmentMethod,
                      }))
                    }
                    className={cn(crm.input, "w-full")}
                  >
                    <option value="manual">Manual</option>
                    <option value="round_robin">Round robin</option>
                    <option value="territory">Territory</option>
                  </select>
                </CrmSettingsRow>
              </div>

              <div className="border-y border-slate-100 px-5 py-3 dark:border-slate-800">
                <p className={crm.sectionLabel}>SLA & hygiene</p>
              </div>
              <div className="px-5">
                <CrmSettingsRow
                  label="Lead response SLA"
                  hint="Hours before a new lead is flagged as overdue."
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={72}
                      value={settings.leadResponseSlaHours}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, leadResponseSlaHours: Number(e.target.value) || 1 }))
                      }
                      className={cn(crm.input, "w-full")}
                    />
                    <span className="shrink-0 text-xs text-slate-400">hours</span>
                  </div>
                </CrmSettingsRow>
                <CrmSettingsRow
                  label="Duplicate detection"
                  hint="Match on phone, email, or either before creating records."
                >
                  <select
                    value={settings.duplicateCheck}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        duplicateCheck: e.target.value as typeof s.duplicateCheck,
                      }))
                    }
                    className={cn(crm.input, "w-full")}
                  >
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                    <option value="phone_and_email">Phone or email</option>
                  </select>
                </CrmSettingsRow>
              </div>

              <div className="border-y border-slate-100 px-5 py-3 dark:border-slate-800">
                <p className={crm.sectionLabel}>Required fields & automation</p>
              </div>
              <div className="px-5 pb-2">
                <CrmSettingsToggleRow
                  label="Require lead source on create"
                  hint="Ensures attribution for every inbound lead."
                  checked={settings.requireSourceOnLead}
                  onChange={(v) => setSettings((s) => ({ ...s, requireSourceOnLead: v }))}
                />
                <CrmSettingsToggleRow
                  label="Require expected close date on deals"
                  hint="Keeps forecast dates complete for reporting."
                  checked={settings.requireCloseDateOnDeal}
                  onChange={(v) => setSettings((s) => ({ ...s, requireCloseDateOnDeal: v }))}
                />
                <CrmSettingsToggleRow
                  label="Auto-create follow-up task on new lead"
                  hint="Creates a same-day task for the assigned owner."
                  checked={settings.autoCreateTaskOnNewLead}
                  onChange={(v) => setSettings((s) => ({ ...s, autoCreateTaskOnNewLead: v }))}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/30">
                <p className="text-xs text-slate-500">Changes apply workspace-wide for all CRM users.</p>
                <div className="flex gap-2">
                  <button type="button" className={crm.btnSecondarySm} onClick={() => setSettings(DEFAULT_CRM_GENERAL_SETTINGS)}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                  <button type="button" className={crm.btnPrimarySm}>
                    <Save className="h-3.5 w-3.5" />
                    Save defaults
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </CrmSetupShell>

      <CrmSetupStageModal
        open={!!editTarget}
        title={editTarget?.type === "deal" ? "Edit deal stage" : "Edit lead stage"}
        initial={modalInitial}
        onClose={() => setEditTarget(null)}
        onSave={saveStage}
      />
    </div>
  );
}

function StageTable({
  stages,
  onEdit,
  onDelete,
}: {
  stages: CrmLeadStageConfig[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <CrmSetupTable columns={["", "Stage", "Type", "Description", ""]}>
      {stages.map((stage) => (
        <tr key={stage.id} className="group hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
          <td className="w-8 px-3 py-3">
            <CrmDragHandle />
          </td>
          <td className="px-3 py-3 font-medium text-slate-900 dark:text-white">{stage.name}</td>
          <td className="px-3 py-3">
            <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${STAGE_KIND_TONE[stage.kind]}`}>
              {STAGE_KIND_LABEL[stage.kind]}
            </span>
          </td>
          <td className="px-3 py-3 text-slate-500">{stage.description}</td>
          <td className="px-3 py-3">
            <CrmRowActions
              onEdit={() => onEdit(stage.id)}
              onDelete={stage.kind === "open" ? () => onDelete(stage.id) : undefined}
            />
          </td>
        </tr>
      ))}
    </CrmSetupTable>
  );
}

function DealStageTable({
  stages,
  onEdit,
  onDelete,
}: {
  stages: CrmDealStageConfig[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <CrmSetupTable columns={["", "Stage", "Probability", "Type", "Exit criteria", ""]}>
      {stages.map((stage) => (
        <tr key={stage.id} className="group hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
          <td className="w-8 px-3 py-3">
            <CrmDragHandle />
          </td>
          <td className="px-3 py-3 font-medium text-slate-900 dark:text-white">{stage.name}</td>
          <td className="px-3 py-3 font-semibold tabular-nums text-[#191970]">{stage.probability}%</td>
          <td className="px-3 py-3">
            <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${STAGE_KIND_TONE[stage.kind]}`}>
              {STAGE_KIND_LABEL[stage.kind]}
            </span>
          </td>
          <td className="px-3 py-3 text-slate-500">{stage.description}</td>
          <td className="px-3 py-3">
            <CrmRowActions
              onEdit={() => onEdit(stage.id)}
              onDelete={stage.kind === "open" ? () => onDelete(stage.id) : undefined}
            />
          </td>
        </tr>
      ))}
    </CrmSetupTable>
  );
}

function PicklistTable({
  items,
  showDescription,
  onDelete,
}: {
  items: CrmPicklistItem[];
  showDescription?: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <CrmSetupTable columns={showDescription ? ["Name", "Description", "Status", ""] : ["Name", "Status", ""]}>
      {items.map((item) => (
        <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{item.name}</td>
          {showDescription ? <td className="px-4 py-3 text-slate-500">{item.description ?? "—"}</td> : null}
          <td className="px-4 py-3">
            <span className={item.active ? "text-xs font-semibold text-emerald-600" : "text-xs font-semibold text-slate-400"}>
              {item.active ? "Active" : "Disabled"}
            </span>
          </td>
          <td className="px-4 py-3">
            <CrmRowActions onDelete={() => onDelete(item.id)} />
          </td>
        </tr>
      ))}
    </CrmSetupTable>
  );
}
