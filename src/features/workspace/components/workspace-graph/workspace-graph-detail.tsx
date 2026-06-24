"use client";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Crown,
  ExternalLink,
  GitBranch,
  Link2,
  Mail,
  Shield,
  Trash2,
  User,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  DEMO_WORKSPACE_EMPLOYEES,
  peerConnectionsFor,
  workspaceModuleMeta,
} from "@/features/workspace/data/workspace-graph-demo";
import type { WorkspaceGraphEdge, WorkspaceGraphNode } from "@/types/workspace-graph";
import { workspaceGraphStore } from "@/stores/workspace-graph.store";
import { cn } from "@/lib/utils/cn";

type Props = {
  node: WorkspaceGraphNode;
  edges: WorkspaceGraphEdge[];
  allNodes: WorkspaceGraphNode[];
  canManage: boolean;
  onBack: () => void;
  onConnectPeer: (nodeId: string) => void;
};

export function WorkspaceGraphDetail({
  node,
  edges,
  allNodes,
  canManage,
  onBack,
  onConnectPeer,
}: Props) {
  const router = useRouter();
  const removeEdge = workspaceGraphStore((s) => s.removeEdge);
  const peers = peerConnectionsFor(node.id, edges);
  const parent = node.parentId ? allNodes.find((n) => n.id === node.parentId) : null;
  const children = allNodes.filter((n) => n.parentId === node.id);
  const employees = DEMO_WORKSPACE_EMPLOYEES[node.id] ?? DEMO_WORKSPACE_EMPLOYEES.ws_alpha ?? [];

  const peerNodeName = (edge: WorkspaceGraphEdge) => {
    const otherId = edge.sourceId === node.id ? edge.targetId : edge.sourceId;
    return allNodes.find((n) => n.id === otherId)?.name ?? "Workspace";
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-white/95 backdrop-blur-sm dark:bg-slate-950/95">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to graph
        </button>
        <div className="flex items-center gap-2">
          {canManage && !node.isMain ? (
            <button
              type="button"
              onClick={() => onConnectPeer(node.id)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#191970]/15 bg-[#191970]/5 px-3 py-2 text-xs font-bold text-[#191970]"
            >
              <GitBranch className="h-3.5 w-3.5" />
              Link workspace
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => router.push(`/${node.slug}/dashboard`)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#191970] px-3 py-2 text-xs font-bold text-white"
          >
            Open workspace
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <span
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white",
                  node.isMain
                    ? "bg-gradient-to-br from-[#191970] to-[#2277FF]"
                    : "bg-gradient-to-br from-slate-700 to-slate-500",
                )}
              >
                {node.name.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{node.name}</h3>
                  {node.isMain ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#191970]/20 bg-[#191970]/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#191970]">
                      <Crown className="h-3 w-3" />
                      Main company
                    </span>
                  ) : null}
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    {node.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {node.industry ?? "Workspace"} · {node.plan} · Created {node.createdAt}
                </p>
                {node.region ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <Building2 className="h-3.5 w-3.5" />
                    {node.region}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-[10px] font-medium text-slate-400">Employees</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{node.employeeCount}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-[10px] font-medium text-slate-400">Modules</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{node.modules.length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-[10px] font-medium text-slate-400">Connections</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{peers.length + (parent ? 1 : 0)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Enabled modules</h4>
              <div className="mt-3 space-y-2">
                {node.modules.map((mod) => {
                  const meta = workspaceModuleMeta(mod);
                  return (
                    <div
                      key={mod}
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 dark:border-slate-800"
                    >
                      <span className={cn("rounded-md border px-2 py-0.5 text-xs font-bold", meta.tone)}>
                        {meta.label}
                      </span>
                      <span className="text-xs text-slate-500">{meta.short}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Workspace admin</h4>
              <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <User className="h-4 w-4 text-slate-400" />
                  {node.adminName}
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <Mail className="h-3.5 w-3.5" />
                  {node.adminEmail}
                </p>
              </div>

              {parent ? (
                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Parent workspace</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <ArrowRight className="h-3.5 w-3.5 text-[#2277FF]" />
                    {parent.name}
                  </p>
                </div>
              ) : null}

              {children.length > 0 ? (
                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Child workspaces</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {children.map((c) => (
                      <span
                        key={c.id}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-2">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Link2 className="h-4 w-4 text-emerald-600" />
                Peer connections
              </h4>
              {peers.length === 0 ? (
                <span className="text-xs text-amber-700">No peer links — workspace is isolated from siblings</span>
              ) : null}
            </div>

            <div className="mt-3 space-y-2">
              {peers.map((edge) => (
                <div
                  key={edge.id}
                  className="flex flex-col gap-2 rounded-xl border border-emerald-100 bg-emerald-50/40 px-3 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-emerald-900/30 dark:bg-emerald-950/20"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {node.name} ↔ {peerNodeName(edge)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{edge.label} · since {edge.createdAt}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {edge.sharedDomains.map((d) => (
                        <span
                          key={d}
                          className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold capitalize text-slate-600 dark:bg-slate-900"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {edge.crossAccess ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                        <Zap className="h-3 w-3" />
                        Same-login access
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-200 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                        <Shield className="h-3 w-3" />
                        Data only
                      </span>
                    )}
                    {canManage ? (
                      <button
                        type="button"
                        onClick={() => removeEdge(edge.id)}
                        className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"
                        aria-label="Remove connection"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Users className="h-4 w-4 text-slate-400" />
              Key people
            </h4>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:border-slate-800">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Role</th>
                    <th className="pb-2 pr-4">Department</th>
                    <th className="pb-2">Cross-workspace</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b border-slate-50 dark:border-slate-800/80">
                      <td className="py-2.5 pr-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{emp.name}</p>
                        <p className="text-xs text-slate-500">{emp.email}</p>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-300">{emp.role}</td>
                      <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-300">{emp.department}</td>
                      <td className="py-2.5">
                        {emp.crossWorkspaceAccess?.length ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            <Zap className="h-3 w-3" />
                            {emp.crossWorkspaceAccess.length} linked
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
