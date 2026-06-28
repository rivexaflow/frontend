"use client";

import { useState } from "react";
import { Check, CheckCircle2, Copy, Download, FileSpreadsheet, Plus, ShieldAlert, Sparkles, Trash2, Upload, Users } from "lucide-react";

import { AdminModal } from "@/features/super-admin/components/admin-modal";
import type { WorkspaceUserRecord } from "@/features/workspace/data/workspace-users-demo";
import type { WorkspaceProfileRole } from "@/features/workspace/data/workspace-user-roles";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  onImport: (newUsers: WorkspaceUserRecord[]) => void;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  password?: string;
  department: string;
  team: string;
  role: WorkspaceProfileRole | "Department Head";
  isHead: boolean;
};

const SAMPLE_CSV = `Anurag Sharma, anurag.sharma@company.com, Pass@1234, Sales, Department Head, APAC Enterprise
Sneha Kapoor, sneha.kapoor@company.com, Pass@1234, Operations, Operations Lead, Global Ops
Rohan Gupta, rohan.gupta@company.com, AutoGen, Support, Support Executive, Tier-1 Support`;

export function BulkUserImportModal({ open, onClose, onImport }: Props) {
  const [mode, setMode] = useState<"builder" | "csv">("csv");
  const [csvText, setCsvText] = useState("");
  const [copied, setCopied] = useState(false);
  const [autoGenPasswords, setAutoGenPasswords] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [builderRows, setBuilderRows] = useState<UserRow[]>([
    { id: "1", name: "", email: "", password: "", department: "Sales", team: "APAC Sales", role: "Senior Sales Executive", isHead: true },
    { id: "2", name: "", email: "", password: "", department: "Support", team: "Customer Success", role: "Support Specialist", isHead: false },
  ]);

  const addBuilderRow = () => {
    setBuilderRows((prev) => [
      ...prev,
      { id: String(Date.now()), name: "", email: "", password: "", department: "Sales", team: "General", role: "Sales Executive", isHead: false },
    ]);
  };

  const removeBuilderRow = (id: string) => {
    setBuilderRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateBuilderRow = (id: string, field: keyof UserRow, val: any) => {
    setBuilderRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, [field]: val };
          if (field === "isHead" && val === true) {
            updated.role = "Department Head";
          }
          return updated;
        }
        return r;
      }),
    );
  };

  const handleCopySample = () => {
    navigator.clipboard.writeText(SAMPLE_CSV);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProcessImport = () => {
    const createdRecords: WorkspaceUserRecord[] = [];

    if (mode === "csv") {
      const lines = csvText.split("\n").map((l) => l.trim()).filter(Boolean);
      lines.forEach((line, idx) => {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length >= 2) {
          const name = parts[0] || `User ${idx + 1}`;
          const email = parts[1] || `user${idx + 1}@company.com`;
          const rawPass = parts[2];
          const dept = parts[3] || "Operations";
          const roleRaw = parts[4] || "Sales Executive";
          const team = parts[5] || "General Team";
          const isHead = roleRaw.toLowerCase().includes("head") || roleRaw.toLowerCase().includes("lead");

          createdRecords.push({
            id: `usr-imp-${Date.now()}-${idx}`,
            name,
            email,
            profileRole: (isHead ? "Senior Sales Executive" : (roleRaw as any)) || "Sales Executive",
            status: "active",
            lastActive: "Just now",
            department: dept,
            team: team + (isHead ? " (Head)" : ""),
            modules: ["crm", "deals", "kyc"],
            joinedAt: "Just now",
            mfaEnabled: true,
          });
        }
      });
    } else {
      builderRows.forEach((row, idx) => {
        if (row.name.trim() && row.email.trim()) {
          createdRecords.push({
            id: `usr-bld-${Date.now()}-${idx}`,
            name: row.name.trim(),
            email: row.email.trim(),
            profileRole: (row.isHead ? "Senior Sales Executive" : (row.role as any)) || "Sales Executive",
            status: "active",
            lastActive: "Just now",
            department: row.department || "General",
            team: row.team + (row.isHead ? " (Department Head)" : ""),
            modules: ["crm", "deals", "kyc"],
            joinedAt: "Just now",
            mfaEnabled: true,
          });
        }
      });
    }

    if (createdRecords.length === 0) {
      alert("Please provide at least one valid user record (Name and Email required).");
      return;
    }

    onImport(createdRecords);
    setSuccessMsg(`Successfully created IDs, passwords & provisioned ${createdRecords.length} users with Department & Team assignments!`);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <AdminModal open={open} onClose={onClose} title="Import Users List & Provision Accounts" className="max-w-2xl">
      <div className="space-y-5 py-2">
        {successMsg ? (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        ) : null}

        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-950 dark:bg-blue-950/30">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#2277FF]" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Batch User Creation & Department Head Assignment
              </h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Import multiple team members at once. User IDs and temporary credentials will be generated automatically, assigning them to their respective departments and team roles.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode("csv")}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-bold transition",
                mode === "csv"
                  ? "bg-[#191970] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
              )}
            >
              Paste CSV / Text List
            </button>
            <button
              type="button"
              onClick={() => setMode("builder")}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-bold transition",
                mode === "builder"
                  ? "bg-[#191970] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
              )}
            >
              Interactive Table Builder
            </button>
          </div>

          {mode === "csv" ? (
            <button
              type="button"
              onClick={handleCopySample}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2277FF] hover:text-[#0056FF]"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied Sample Format!" : "Copy Sample CSV Format"}
            </button>
          ) : null}
        </div>

        {mode === "csv" ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Paste User Records (Format: Name, Email, Password, Department, Role, Team)
              </label>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={6}
                placeholder={SAMPLE_CSV}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 font-mono text-xs text-slate-800 outline-none focus:border-[#2277FF] focus:ring-2 focus:ring-[#2277FF]/15 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
              {builderRows.map((row) => (
                <div key={row.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-950/40">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={row.name}
                    onChange={(e) => updateBuilderRow(row.id, "name", e.target.value)}
                    className="h-8 min-w-[120px] flex-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={row.email}
                    onChange={(e) => updateBuilderRow(row.id, "email", e.target.value)}
                    className="h-8 min-w-[140px] flex-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Department (e.g. Sales)"
                    value={row.department}
                    onChange={(e) => updateBuilderRow(row.id, "department", e.target.value)}
                    className="h-8 w-28 rounded-lg border border-slate-200 bg-white px-2.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Team"
                    value={row.team}
                    onChange={(e) => updateBuilderRow(row.id, "team", e.target.value)}
                    className="h-8 w-28 rounded-lg border border-slate-200 bg-white px-2.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-900"
                  />
                  <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={row.isHead}
                      onChange={(e) => updateBuilderRow(row.id, "isHead", e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-[#2277FF]"
                    />
                    Dept Head
                  </label>
                  {builderRows.length > 1 && (
                    <button type="button" onClick={() => removeBuilderRow(row.id)} className="p-1 text-slate-400 hover:text-rose-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addBuilderRow}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Another User Row
            </button>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/30">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoGenPasswords}
              onChange={(e) => setAutoGenPasswords(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#2277FF]"
            />
            Auto-generate secure passwords and email onboarding credentials
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProcessImport}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-[#191970] to-[#2277FF] px-5 text-xs font-bold text-white shadow-md shadow-[#2277FF]/25 hover:opacity-95 transition-all"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Provision Users Batch
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
