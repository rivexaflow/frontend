"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  CrmFilterButton,
  CrmPanel,
  CrmPanelBody,
  CrmPanelFooter,
  CrmPanelToolbar,
} from "@/features/workspace/components/crm/crm-panel";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { CrmListSummary } from "@/features/workspace/components/crm/crm-list-summary";
import { CrmPrimaryButton } from "@/features/workspace/components/crm/crm-ui-primitives";
import { CrmPageHeader } from "@/features/workspace/components/crm/crm-workspace-header";
import {
  EnterpriseDataTable,
  StatusBadge,
  type TableColumn,
} from "@/features/workspace/components/enterprise/enterprise-data-table";
import {
  CRM_TASK_PRIORITY_META,
  CRM_TASK_STATUS_META,
  DEMO_CRM_TASKS,
  type CrmTaskPriority,
  type CrmTaskRecord,
  type CrmTaskStatus,
} from "@/features/workspace/data/crm-extended-demo";
import { DEMO_LEADS } from "@/features/workspace/data/crm-demo";
import { authStore } from "@/stores/auth.store";

const selectClass = crm.select;

type Props = {
  mode?: "all" | "mine";
};

export function CrmTasksView({ mode = "all" }: Props) {
  const currentUser = authStore((s) => s.user?.name ?? "Priya Singh");
  const [tasks, setTasks] = useState<CrmTaskRecord[]>(DEMO_CRM_TASKS);
  const [query, setQuery] = useState("");
  const [userFilter, setUserFilter] = useState(mode === "mine" ? currentUser : "");
  const [leadFilter, setLeadFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<CrmTaskStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<CrmTaskPriority | "">("");

  const owners = useMemo(() => [...new Set(tasks.map((t) => t.assignedTo))].sort(), [tasks]);
  const leadOptions = useMemo(() => DEMO_LEADS.map((l) => ({ ref: l.reference, name: l.name })), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (mode === "mine" && t.assignedTo !== currentUser) return false;
      if (userFilter && t.assignedTo !== userFilter) return false;
      if (leadFilter && t.leadRef !== leadFilter) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (q && !t.name.toLowerCase().includes(q) && !t.leadName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tasks, mode, currentUser, userFilter, leadFilter, statusFilter, priorityFilter, query]);

  const stats = useMemo(() => {
    const base = mode === "mine" ? tasks.filter((t) => t.assignedTo === currentUser) : tasks;
    return {
      total: base.length,
      pending: base.filter((t) => t.status === "pending").length,
      high: base.filter((t) => t.priority === "high" && t.status !== "completed").length,
    };
  }, [tasks, mode, currentUser]);

  const columns: TableColumn<CrmTaskRecord>[] = [
    {
      key: "task",
      header: "Task name",
      render: (row) => <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span>,
    },
    {
      key: "lead",
      header: "Lead",
      render: (row) => (
        <div>
          <p className="text-sm text-slate-800">{row.leadName}</p>
          <p className="font-mono text-[10px] text-slate-400">{row.leadRef}</p>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (row) => (
        <StatusBadge label={CRM_TASK_PRIORITY_META[row.priority].label} tone={CRM_TASK_PRIORITY_META[row.priority].tone} />
      ),
    },
    {
      key: "due",
      header: "Due date",
      render: (row) => <span className="text-xs tabular-nums text-slate-600">{row.dueAt}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge label={CRM_TASK_STATUS_META[row.status].label} tone={CRM_TASK_STATUS_META[row.status].tone} />
      ),
    },
    {
      key: "owner",
      header: "Assigned to",
      render: (row) => <span className="text-sm text-slate-700">{row.assignedTo}</span>,
    },
  ];

  const removeTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="pb-4">
      <CrmPageHeader
        metrics={[
          { label: "Total", value: stats.total },
          { label: "Pending", value: stats.pending },
          { label: "High priority", value: stats.high },
        ]}
        actions={
          <CrmPrimaryButton>
            <Plus className="h-3.5 w-3.5" />
            Add task
          </CrmPrimaryButton>
        }
      />

      <CrmPanel>
        <CrmPanelToolbar
          search={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search tasks or leads…"
          filters={
            <>
              <CrmFilterButton />
              {mode === "all" ? (
                <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className={selectClass}>
                  <option value="">All assignees</option>
                  {owners.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : null}
              <select value={leadFilter} onChange={(e) => setLeadFilter(e.target.value)} className={selectClass}>
                <option value="">All leads</option>
                {leadOptions.map((l) => (
                  <option key={l.ref} value={l.ref}>{l.name}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as CrmTaskStatus | "")} className={selectClass}>
                <option value="">Status</option>
                {(Object.keys(CRM_TASK_STATUS_META) as CrmTaskStatus[]).map((s) => (
                  <option key={s} value={s}>{CRM_TASK_STATUS_META[s].label}</option>
                ))}
              </select>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as CrmTaskPriority | "")} className={selectClass}>
                <option value="">Priority</option>
                {(Object.keys(CRM_TASK_PRIORITY_META) as CrmTaskPriority[]).map((p) => (
                  <option key={p} value={p}>{CRM_TASK_PRIORITY_META[p].label}</option>
                ))}
              </select>
            </>
          }
        />
        <CrmPanelBody>
          <EnterpriseDataTable
            columns={columns}
            rows={filtered}
            emptyMessage="No tasks match your filters."
            renderActions={(row) => (
              <div className="flex justify-end gap-0.5">
                <button type="button" className="rounded-md p-1.5 text-slate-400 hover:bg-[#191970]/10 hover:text-[#191970]" aria-label="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => removeTask(row.id)} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          />
        </CrmPanelBody>
        <CrmPanelFooter>
          <CrmListSummary showing={filtered.length} total={tasks.length} label="tasks" />
        </CrmPanelFooter>
      </CrmPanel>
    </div>
  );
}
