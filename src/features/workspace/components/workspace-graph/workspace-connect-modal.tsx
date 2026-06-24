"use client";

import { FormEvent, useEffect, useState } from "react";
import { Link2, X } from "lucide-react";

import { AdminModal } from "@/features/super-admin/components/admin-modal";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { workspaceGraphStore } from "@/stores/workspace-graph.store";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
};

const DOMAIN_OPTIONS = [
  { id: "employees", label: "Employees & identity" },
  { id: "hrm", label: "HRM records" },
  { id: "crm", label: "CRM data" },
  { id: "kyc", label: "KYC compliance" },
  { id: "billing", label: "Billing" },
] as const;

export function WorkspaceConnectModal({ open, onClose }: Props) {
  const nodes = workspaceGraphStore((s) => s.nodes);
  const addPeerConnection = workspaceGraphStore((s) => s.addPeerConnection);
  const connectSourceId = workspaceGraphStore((s) => s.connectSourceId);
  const childNodes = nodes.filter((n) => !n.isMain);

  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [crossAccess, setCrossAccess] = useState(true);
  const [domains, setDomains] = useState<string[]>(["employees", "hrm", "crm"]);

  useEffect(() => {
    if (!open) return;
    const first = connectSourceId || childNodes[0]?.id || "";
    const second = childNodes.find((n) => n.id !== first)?.id ?? childNodes[1]?.id ?? "";
    setSourceId(first);
    setTargetId(second);
    setCrossAccess(true);
    setDomains(["employees", "hrm", "crm"]);
  }, [open, childNodes, connectSourceId]);

  const toggleDomain = (id: string) => {
    setDomains((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId || sourceId === targetId) return;
    addPeerConnection(sourceId, targetId, {
      crossAccess,
      sharedDomains: domains as ("employees" | "crm" | "hrm" | "kyc" | "billing")[],
    });
    onClose();
  };

  return (
    <AdminModal
      open={open}
      title="Connect workspaces"
      description="Link child workspaces for shared data and optional same-login employee access across environments."
      onClose={onClose}
      className="sm:max-w-lg"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">From workspace</span>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className={cn(crm.select, "w-full")}
              required
            >
              {childNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">To workspace</span>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className={cn(crm.select, "w-full")}
              required
            >
              {childNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
          <input
            type="checkbox"
            checked={crossAccess}
            onChange={(e) => setCrossAccess(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <span className="block text-sm font-bold text-emerald-950">Enable employee cross-access</span>
            <span className="mt-0.5 block text-xs text-emerald-800/80">
              Connected employees can sign in to the peer workspace with the same email and password — no
              separate account required.
            </span>
          </span>
        </label>

        <fieldset>
          <legend className="mb-2 text-xs font-semibold text-slate-600">Shared data domains</legend>
          <div className="flex flex-wrap gap-2">
            {DOMAIN_OPTIONS.map((opt) => {
              const active = domains.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleDomain(opt.id)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                    active
                      ? "border-[#191970] bg-[#191970]/10 text-[#191970]"
                      : "border-slate-200 text-slate-600 hover:border-slate-300",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={!sourceId || !targetId || sourceId === targetId}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#191970] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#050a1f] disabled:opacity-50"
          >
            <Link2 className="h-4 w-4" />
            Create connection
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
