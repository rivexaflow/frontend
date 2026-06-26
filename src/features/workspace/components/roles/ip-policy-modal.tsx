"use client";

import { useState } from "react";
import { Check, Shield, X, AlertCircle } from "lucide-react";
import { workspaceRolesStore } from "@/stores/workspace-roles.store";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function IpPolicyModal({ open, onClose }: Props) {
  const roles = workspaceRolesStore((s) => s.roles);
  const upsertRole = workspaceRolesStore((s) => s.upsertRole);

  const [ipAddress, setIpAddress] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"overwrite" | "append">("append");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  // We restrict IP policies to custom roles since system roles are locked/read-only.
  const customRoles = roles.filter((r) => !r.systemLocked);

  const handleToggleRole = (id: string) => {
    const next = new Set(selectedRoleIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRoleIds(next);
  };

  const handleSelectAll = () => {
    if (selectedRoleIds.size === customRoles.length) {
      setSelectedRoleIds(new Set());
    } else {
      setSelectedRoleIds(new Set(customRoles.map((r) => r.id)));
    }
  };

  const handleApply = () => {
    setError(null);
    setSuccess(false);

    const trimmedIp = ipAddress.trim();
    if (!trimmedIp) {
      setError("Please enter a valid IP address or CIDR range.");
      return;
    }

    if (selectedRoleIds.size === 0) {
      setError("Please select at least one role to map this IP to.");
      return;
    }

    // Apply the IP address configurations to all selected roles
    roles.forEach((role) => {
      if (selectedRoleIds.has(role.id)) {
        let finalIps = trimmedIp;
        if (mode === "append" && role.allowedIps) {
          const current = role.allowedIps.split(",").map((ip) => ip.trim()).filter(Boolean);
          const added = trimmedIp.split(",").map((ip) => ip.trim()).filter(Boolean);
          const combined = Array.from(new Set([...current, ...added]));
          finalIps = combined.join(", ");
        }

        upsertRole({
          ...role,
          allowedIps: finalIps,
        });
      }
    });

    setSuccess(true);
    setIpAddress("");
    setSelectedRoleIds(new Set());
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div 
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#191970]/10 text-[#191970] dark:bg-blue-950/40 dark:text-blue-300">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">IP Access Policy Manager</h3>
              <p className="text-xs text-slate-400">Map network security filters to roles in bulk</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Check className="h-8 w-8 animate-pulse" />
              </div>
              <h4 className="mt-4 text-base font-bold text-slate-900 dark:text-white">Policies Updated!</h4>
              <p className="mt-1 text-sm text-slate-500">IP constraints successfully applied to selected roles.</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800 dark:border-rose-950/40 dark:bg-rose-950/15 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-450" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Input IP */}
              <div className="space-y-2">
                <label htmlFor="modal-allowed-ips" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  1. Enter Allowed IP(s) or CIDR Block
                </label>
                <input
                  id="modal-allowed-ips"
                  type="text"
                  placeholder="e.g. 192.168.1.45, 203.0.113.0/24"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  Workspace members with any of the selected roles will be restricted to logging in only from these IPs. Separate multiple entries with commas.
                </p>
              </div>

              {/* Action Mode Toggle */}
              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-950/20">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Policy Conflict Mode</h4>
                  <p className="text-[10px] text-slate-450 leading-snug">How to handle existing IP filters on selected roles</p>
                </div>
                <div className="flex gap-1 rounded-lg bg-slate-200/80 p-0.5 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setMode("append")}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[11px] font-bold transition",
                      mode === "append"
                        ? "bg-white text-[#191970] shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    )}
                  >
                    Append
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("overwrite")}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[11px] font-bold transition",
                      mode === "overwrite"
                        ? "bg-white text-[#191970] shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    )}
                  >
                    Overwrite
                  </button>
                </div>
              </div>

              {/* Step 2: Select Roles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    2. Select Roles to Map
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-bold text-[#191970] hover:underline dark:text-blue-400"
                  >
                    {selectedRoleIds.size === customRoles.length ? "Deselect all" : "Select all custom"}
                  </button>
                </div>

                <div className="max-h-[180px] overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                  {customRoles.map((role) => {
                    const checked = selectedRoleIds.has(role.id);
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleToggleRole(role.id)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50/80 dark:hover:bg-slate-850/40"
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
                            checked 
                              ? "border-[#191970] bg-[#191970] text-white" 
                              : "border-slate-350 bg-white dark:border-slate-655"
                          )}>
                            {checked ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
                          </span>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {role.name}
                          </span>
                        </div>
                        {role.allowedIps && (
                          <span className="max-w-[120px] truncate rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-550 dark:bg-slate-800 dark:text-slate-400">
                            Current: {role.allowedIps}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="rounded-lg bg-[#191970] px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#12124a]"
                >
                  Apply Rules
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
