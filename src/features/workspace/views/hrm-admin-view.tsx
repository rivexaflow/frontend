"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
} from "lucide-react";

import { CrmPanel, CrmShell } from "@/features/workspace/components/crm/crm-panel";
import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import {
  HrmRoleEditorPanel,
  type RoleDraft,
} from "@/features/workspace/components/hrm/settings/hrm-role-editor-panel";
import { HrmRolesCatalogList } from "@/features/workspace/components/hrm/settings/hrm-roles-catalog-list";
import {
  HrmRolesToolbar,
  type HrmRoleTypeFilter,
} from "@/features/workspace/components/hrm/settings/hrm-roles-toolbar";
import {
  enrichHrmRoles,
  type HrmRoleRecord,
} from "@/features/workspace/data/hrm-roles-demo";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import { createHrRole, deleteHrRole, fetchHrRoles, updateHrRole } from "@/lib/api/hrm";
import { MISSING_COMPANY_CONTEXT_MESSAGE } from "@/lib/workspace/company-context";
import { authStore } from "@/stores/auth.store";
import { duplicateHrmRole, hrmRolesStore } from "@/stores/hrm-roles.store";
import { effectiveNavRole, type CurrentUser, type Role } from "@/types/auth";
import type { HrmRole } from "@/types/hrm";

/** Workspace owners/admins — or any session with HR company context on this settings page. */
function canManageHrmRoleSettings(
  user: CurrentUser | null,
  role: Role | null,
  hasCompanyContext: boolean,
): boolean {
  const effective = effectiveNavRole(user) ?? role;
  if (effective === "SUPER_ADMIN" || effective === "ADMIN") return true;
  if (hasCompanyContext && user?.id && user.id !== "unknown") return true;
  return false;
}

export function HrmAdminView() {
  const companyId = useHrCompanyId();
  const user = authStore((s) => s.user);
  const authRole = authStore((s) => s.role);
  const canManage = canManageHrmRoleSettings(user, authRole, Boolean(companyId));

  const roles = hrmRolesStore((s) => s.roles);
  const hydrate = hrmRolesStore((s) => s.hydrate);
  const upsertRole = hrmRolesStore((s) => s.upsertRole);
  const removeRole = hrmRolesStore((s) => s.removeRole);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<HrmRoleTypeFilter>("all");
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    if (hrmRolesStore.getState().hydrated && !force) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const roleList = await fetchHrRoles(companyId);
      hydrate(enrichHrmRoles(roleList));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load HR roles.");
      hydrate(enrichHrmRoles([]));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId, hydrate]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roles.filter((r) => {
      if (q && !`${r.name} ${r.description ?? ""} ${r.scope}`.toLowerCase().includes(q)) return false;
      if (typeFilter === "system" && !r.isSystem) return false;
      if (typeFilter === "custom" && r.isSystem) return false;
      return true;
    });
  }, [roles, query, typeFilter]);

  const selected = selectedId ? roles.find((r) => r.id === selectedId) ?? null : null;

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filtered.some((r) => r.id === selectedId)) {
      setSelectedId(filtered[0]!.id);
    }
  }, [filtered, selectedId]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    window.setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    void load(true);
  };

  const handleRoleCreated = (role: HrmRole) => {
    const record = enrichHrmRoles([role]).find((r) => r.id === role.id) ?? {
      ...role,
      isSystem: false,
      scope: "organization" as const,
      memberCount: 0,
      permissionKeys: role.permissions ?? [],
    };
    upsertRole(record);
    setSelectedId(record.id);
    showSuccess(`Role "${record.name}" created.`);
  };

  const handleSaveRole = async (draft: RoleDraft) => {
    if (!selected || !companyId) return;
    setSaving(true);
    setError(null);
    const permissionKeys = [...draft.permissionKeys];
    try {
      await updateHrRole(companyId, selected.id, {
        name: selected.isSystem ? undefined : draft.name.trim(),
        description: draft.description.trim() || undefined,
        permissions: permissionKeys,
      });
      const updated: HrmRoleRecord = {
        ...selected,
        name: selected.isSystem ? selected.name : draft.name.trim(),
        description: draft.description.trim() || undefined,
        scope: draft.scope,
        permissionKeys,
        permissions: permissionKeys,
      };
      upsertRole(updated);
      showSuccess(`Permissions saved for "${updated.name}".`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save role.");
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = () => {
    if (!selected) return;
    const copy = duplicateHrmRole(selected);
    upsertRole(copy);
    setSelectedId(copy.id);
    showSuccess(`Duplicated as "${copy.name}".`);
  };

  const handleDelete = async () => {
    if (!selected || !companyId || selected.isSystem) return;
    setError(null);
    try {
      await deleteHrRole(companyId, selected.id);
      removeRole(selected.id);
      showSuccess(`Role "${selected.name}" deleted.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete role.");
    }
  };

  return (
    <div className="pb-4">
      <CrmShell>
        <div className="space-y-3 p-3 md:p-4">
          {!companyId ? (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{MISSING_COMPANY_CONTEXT_MESSAGE}</p>
            </div>
          ) : null}

          {!canManage && companyId ? (
            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              <p>Sign in as a workspace admin to edit HR role permissions.</p>
            </div>
          ) : null}

          {successMessage ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {successMessage}
            </div>
          ) : null}

          {error ? (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          <CrmPanel className="overflow-hidden">
            <HrmRolesToolbar
              query={query}
              onQueryChange={setQuery}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              resultCount={filtered.length}
              onCreateRole={() => setRoleModalOpen(true)}
              canManage={canManage}
              onRefresh={handleRefresh}
              refreshing={refreshing}
            />

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading roles…
              </div>
            ) : (
              <div className="grid min-h-[620px] lg:grid-cols-[minmax(300px,360px)_1fr]">
                <div className="max-h-[min(780px,75vh)] overflow-y-auto border-b border-slate-200/90 lg:border-b-0 lg:border-r dark:border-slate-800">
                  <HrmRolesCatalogList
                    roles={filtered}
                    selectedId={selectedId}
                    onSelect={(role) => setSelectedId(role.id)}
                  />
                </div>

                <div className="min-h-[480px]">
                  {selected ? (
                    <HrmRoleEditorPanel
                      key={selected.id}
                      role={selected}
                      canManage={canManage}
                      saving={saving}
                      onSave={handleSaveRole}
                      onDuplicate={canManage ? handleDuplicate : undefined}
                      onDelete={canManage && !selected.isSystem ? handleDelete : undefined}
                    />
                  ) : (
                    <div className="flex h-full min-h-[480px] flex-col items-center justify-center px-8 text-center">
                      <Shield className="h-10 w-10 text-slate-300" />
                      <p className="mt-4 text-sm font-semibold text-slate-800">Select an HR role</p>
                      <p className="mt-1 max-w-sm text-sm text-slate-500">
                        Choose a role from the catalog to configure module permissions, scope, and member assignments.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CrmPanel>
        </div>
      </CrmShell>

      <CreateRoleModal
        open={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        onCreated={handleRoleCreated}
        companyId={companyId}
      />
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
    if (!open) return;
    setName("");
    setDescription("");
    setError(null);
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
        permissions: [],
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
      title="Create HR role"
      description="Start with a blank policy, then assign module permissions from the editor."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Role name" htmlFor="role-name">
          <input
            id="role-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClassName}
            placeholder="e.g. Regional HR Partner"
            disabled={submitting}
          />
        </FormField>
        <FormField label="Description" htmlFor="role-desc">
          <input
            id="role-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClassName}
            placeholder="Job function and data scope summary"
            disabled={submitting}
          />
        </FormField>
        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#191970] px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create role
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
