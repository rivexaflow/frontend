"use client";

import { useEffect, useMemo, useState } from "react";
import { GitBranch } from "lucide-react";

import { fetchAdminWorkflows } from "@/lib/api/admin";
import { formatCount } from "@/lib/api/admin-normalize";
import type { AdminWorkflow } from "@/types/admin";
import { StatusBadge } from "@/components/shared/status-badge/status-badge";
import {
  AdminAlert,
  AdminEmptyState,
  AdminPanel,
  AdminSearchInput,
  AdminSkeletonRows,
  AdminTable,
  AdminTableFooter,
  AdminTableWrap,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminToolbar,
  AdminTr,
  AdminTbody,
  adminSelectClass,
} from "@/features/super-admin/components/admin-ui";
import { SuperAdminAppShell } from "@/features/super-admin/components/super-admin-app-shell";

function workflowTone(s: AdminWorkflow["status"]): "success" | "warning" | "danger" | "neutral" {
  if (s === "ACTIVE") return "success";
  if (s === "DRAFT") return "neutral";
  return "warning";
}

export function AdminWorkflowsView() {
  const [workflows, setWorkflows] = useState<AdminWorkflow[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AdminWorkflow["status"] | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAdminWorkflows();
        if (!cancelled) setWorkflows(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load workflows");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return workflows.filter((w) => {
      if (status && w.status !== status) return false;
      if (!q) return true;
      return w.name.toLowerCase().includes(q) || w.companyName.toLowerCase().includes(q);
    });
  }, [workflows, search, status]);

  return (
    <SuperAdminAppShell
      title="Workflows"
      description="Platform-wide automation pipelines — monitor execution volume and tenant ownership."
    >
      {error ? <AdminAlert>{error}</AdminAlert> : null}

      <AdminToolbar>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Search workflow or company…" />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AdminWorkflow["status"] | "")}
          className={adminSelectClass}
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="DRAFT">DRAFT</option>
          <option value="PAUSED">PAUSED</option>
        </select>
      </AdminToolbar>

      <AdminPanel title="Workflow registry" description={`${workflows.length} pipelines across tenants`}>
        <AdminTableWrap>
          <AdminTable minWidth="760px">
            <AdminThead>
              <AdminTh>Workflow</AdminTh>
              <AdminTh>Company</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Runs (24h)</AdminTh>
              <AdminTh>Updated</AdminTh>
            </AdminThead>
            <AdminTbody>
              {loading ? (
                <AdminSkeletonRows cols={5} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <AdminEmptyState
                      icon={GitBranch}
                      title="No workflows found"
                      description="Try a different search term or status filter."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((w) => (
                  <AdminTr key={w.id}>
                    <AdminTd>
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#eef2ff] text-[#4338ca]">
                          <GitBranch className="h-4 w-4" />
                        </span>
                        <span className="font-semibold text-[#191970]">{w.name}</span>
                      </div>
                    </AdminTd>
                    <AdminTd className="text-slate-600">{w.companyName}</AdminTd>
                    <AdminTd>
                      <StatusBadge label={w.status} tone={workflowTone(w.status)} />
                    </AdminTd>
                    <AdminTd>
                      <span className="font-mono text-sm font-medium text-slate-700">{formatCount(w.runs24h)}</span>
                    </AdminTd>
                    <AdminTd className="text-xs text-slate-500">
                      {new Date(w.updatedAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </AdminTd>
                  </AdminTr>
                ))
              )}
            </AdminTbody>
          </AdminTable>
        </AdminTableWrap>
        {!loading ? (
          <AdminTableFooter
            left={
              <>
                Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of{" "}
                <span className="font-semibold text-slate-700">{workflows.length}</span> workflows
              </>
            }
          />
        ) : null}
      </AdminPanel>
    </SuperAdminAppShell>
  );
}
