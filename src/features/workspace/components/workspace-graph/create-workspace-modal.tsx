"use client";

import { FormEvent, useState } from "react";
import { Building2, Plus, X } from "lucide-react";

import { AdminModal } from "@/features/super-admin/components/admin-modal";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { workspaceGraphStore } from "@/stores/workspace-graph.store";
import type { WorkspaceGraphNode } from "@/types/workspace-graph";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateWorkspaceModal({ open, onClose }: Props) {
  const addNode = workspaceGraphStore((s) => s.addNode);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [plan, setPlan] = useState<"Growth" | "Startup" | "Enterprise">("Growth");
  const [region, setRegion] = useState("APAC · Singapore");
  const [employeeCount, setEmployeeCount] = useState(15);
  const [selectedModules, setSelectedModules] = useState<string[]>(["crm", "deals", "kyc", "hrm"]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const generatedSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, "");

    const newNode: WorkspaceGraphNode = {
      id: `ws_${Date.now()}`,
      name: name.trim(),
      slug: generatedSlug,
      plan,
      isMain: false,
      parentId: "main_co",
      status: "active",
      adminName: "Workspace Lead",
      adminEmail: `lead@${generatedSlug.toLowerCase()}.com`,
      employeeCount: Number(employeeCount) || 10,
      region,
      modules: selectedModules as any[],
      createdAt: "Just now",
    };

    addNode(newNode);
    setName("");
    setSlug("");
    onClose();
  };

  const toggleModule = (mod: string) => {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod],
    );
  };

  return (
    <AdminModal
      open={open}
      title="Add Child Workspace Branch"
      description="Create and connect a new organizational workspace to your topology graph."
      onClose={onClose}
      className="sm:max-w-md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Workspace Name</label>
          <input
            type="text"
            placeholder="e.g. Finance Hub, APAC Enterprise"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cn(crm.input, "w-full")}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Subscription Plan</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as any)}
              className={cn(crm.select, "w-full")}
            >
              <option value="Growth">Growth Plan</option>
              <option value="Startup">Startup Plan</option>
              <option value="Enterprise">Enterprise Plan</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Employee Workforce</label>
            <input
              type="number"
              value={employeeCount}
              onChange={(e) => setEmployeeCount(Number(e.target.value))}
              className={cn(crm.input, "w-full")}
              min={1}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Region & Operations</label>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className={cn(crm.input, "w-full")}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Active Module Stack</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "crm", label: "CRM Sales" },
              { id: "deals", label: "Deals Pipeline" },
              { id: "kyc", label: "KYC Verification" },
              { id: "hrm", label: "HRM System" },
              { id: "invoices", label: "Invoicing" },
            ].map((mod) => {
              const active = selectedModules.includes(mod.id);
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-xs font-semibold transition",
                    active
                      ? "border-[#191970] bg-[#191970]/10 text-[#191970]"
                      : "border-slate-200 text-slate-600 hover:border-slate-300",
                  )}
                >
                  {mod.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#191970] px-4 py-2 text-xs font-bold text-white hover:bg-[#12124a] transition"
          >
            <Plus className="h-4 w-4" />
            Create & Add Node
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
