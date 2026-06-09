"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, Plus, RefreshCw, Shield } from "lucide-react";

import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import { MISSING_COMPANY_CONTEXT_MESSAGE } from "@/lib/workspace/company-context";
import { createHrRole, fetchHrRoles } from "@/lib/api/hrm";
import type { HrmRole } from "@/types/hrm";

export function HrmAdminView() {
  const companyId = useHrCompanyId();
  const [roles, setRoles] = useState<HrmRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const load = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const roleList = await fetchHrRoles(companyId);
      setRoles(roleList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load HR roles.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const handleRefresh = () => {
    setRefreshing(true);
    void load();
  };

  return (
    <div className="pb-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">People · HRM</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">HR roles</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Custom HR roles for payroll, recruiting, and compliance operations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Shield className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">HR roles</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{roles.length}</span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || !companyId}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {!companyId ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{MISSING_COMPANY_CONTEXT_MESSAGE}</p>
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/90 px-4 py-4 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Role directory</h2>
          <button
            type="button"
            onClick={() => setRoleModalOpen(true)}
            disabled={!companyId}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white transition hover:bg-[#12124a] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add role
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-20 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <RolesTable roles={roles} />
        )}
      </div>

      <CreateRoleModal
        open={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        onCreated={(role) => setRoles((prev) => [role, ...prev])}
        companyId={companyId}
      />
    </div>
  );
}

function RolesTable({ roles }: { roles: HrmRole[] }) {
  if (roles.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No HR roles yet</p>
        <p className="mt-1 text-sm text-slate-500">Define custom roles for payroll, recruiting, and HR ops.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Permissions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {roles.map((role) => (
            <tr key={role.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
              <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{role.name}</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{role.description ?? "—"}</td>
              <td className="px-4 py-3 text-slate-500">
                {role.permissions?.length ? role.permissions.join(", ") : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CreateRoleModal({
  open,
  onClose,
  onCreated,
  companyId,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (role: HrmRole) => void;
  companyId: string | null;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    if (!name.trim()) {
      setError("Role name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await createHrRole(companyId, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create role.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EnterpriseFormModal
      open={open}
      title="Add HR role"
      description="Define a custom role for HR operations (recruiting, payroll, compliance)."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Role name" htmlFor="role-name">
          <input
            id="role-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            className={inputClassName}
            placeholder="e.g. Payroll Specialist"
            disabled={submitting}
          />
        </FormField>
        <FormField label="Description" htmlFor="role-desc">
          <input
            id="role-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClassName}
            placeholder="Optional scope summary"
            disabled={submitting}
          />
        </FormField>
        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#191970] px-5 text-sm font-semibold text-white transition hover:bg-[#12124a] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create role
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
