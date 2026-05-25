"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Cpu, Pencil, Plus, Trash2 } from "lucide-react";
import { z } from "zod";

import {
  createAdminAiModel,
  deleteAdminAiModel,
  fetchAdminAiModels,
  toggleAdminAiModel,
  updateAdminAiModel,
} from "@/lib/api/admin";
import { formatCount } from "@/lib/api/admin-normalize";
import type { AdminAiModel } from "@/types/admin";
import { AdminModal } from "@/features/super-admin/components/admin-modal";
import {
  AdminAlert,
  AdminBtnPrimary,
  AdminBtnSecondary,
  AdminEmptyState,
  AdminPanel,
  AdminSkeletonRows,
  AdminTable,
  AdminTableWrap,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr,
  AdminTbody,
  adminInputClass,
} from "@/features/super-admin/components/admin-ui";
import { SuperAdminAppShell } from "@/features/super-admin/components/super-admin-app-shell";
import { StatusBadge } from "@/components/shared/status-badge/status-badge";
import { cn } from "@/lib/utils";

const modelSchema = z.object({
  name: z.string().min(2, "Name is required"),
  provider: z.string().min(2, "Provider is required"),
  modelId: z.string().min(2, "Model ID is required"),
  apiKey: z.string().min(8, "API key must be at least 8 characters"),
  enabled: z.boolean().optional(),
});

type FormState = z.infer<typeof modelSchema>;

const emptyForm: FormState = {
  name: "",
  provider: "",
  modelId: "",
  apiKey: "",
  enabled: true,
};

const providerColors: Record<string, string> = {
  openai: "bg-emerald-50 text-emerald-800 ring-emerald-200/60",
  anthropic: "bg-orange-50 text-orange-800 ring-orange-200/60",
  google: "bg-sky-50 text-sky-800 ring-sky-200/60",
};

export function AdminAiModelsView() {
  const [models, setModels] = useState<AdminAiModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<AdminAiModel | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminAiModels();
      setModels(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load AI models");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setModal("create");
  };

  const openEdit = (model: AdminAiModel) => {
    setEditing(model);
    setForm({
      name: model.name,
      provider: model.provider,
      modelId: model.modelId,
      apiKey: "",
      enabled: model.enabled,
    });
    setFormError(null);
    setModal("edit");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (modal === "edit" && !form.apiKey) {
      const parsed = modelSchema.omit({ apiKey: true }).safeParse(form);
      if (!parsed.success) {
        setFormError(parsed.error.issues[0]?.message ?? "Invalid form");
        return;
      }
    } else {
      const parsed = modelSchema.safeParse(form);
      if (!parsed.success) {
        setFormError(parsed.error.issues[0]?.message ?? "Invalid form");
        return;
      }
    }

    setSaving(true);
    try {
      if (modal === "create") {
        await createAdminAiModel({
          name: form.name,
          provider: form.provider,
          modelId: form.modelId,
          apiKey: form.apiKey,
          enabled: form.enabled,
        });
      } else if (editing) {
        await updateAdminAiModel(editing.id, {
          name: form.name,
          provider: form.provider,
          modelId: form.modelId,
          ...(form.apiKey ? { apiKey: form.apiKey } : {}),
          enabled: form.enabled,
        });
      }
      setModal(null);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onToggle = async (model: AdminAiModel) => {
    setBusyId(model.id);
    try {
      await toggleAdminAiModel(model.id, !model.enabled);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Toggle failed");
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (model: AdminAiModel) => {
    if (!window.confirm(`Remove model "${model.name}"? This cannot be undone.`)) return;
    setBusyId(model.id);
    try {
      await deleteAdminAiModel(model.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SuperAdminAppShell
      title="AI models"
      description="Configure platform-wide AI providers, model identifiers, and encrypted API credentials. Keys are never shown in full after save."
    >
      {error ? <AdminAlert>{error}</AdminAlert> : null}

      <AdminPanel
        title="Model registry"
        description={`${models.length} providers configured`}
        action={
          <AdminBtnPrimary onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add model
          </AdminBtnPrimary>
        }
      >
        <AdminTableWrap>
          <AdminTable minWidth="920px">
            <AdminThead>
              <AdminTh>Model</AdminTh>
              <AdminTh>Provider</AdminTh>
              <AdminTh>Model ID</AdminTh>
              <AdminTh>API key</AdminTh>
              <AdminTh>Usage</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh className="text-right">Actions</AdminTh>
            </AdminThead>
            <AdminTbody>
              {loading ? (
                <AdminSkeletonRows cols={7} rows={4} />
              ) : models.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <AdminEmptyState
                      icon={Cpu}
                      title="No AI models configured"
                      description="Add your first provider to enable platform-wide AI features."
                    />
                  </td>
                </tr>
              ) : (
                models.map((m) => (
                  <AdminTr key={m.id} className={cn(busyId === m.id && "opacity-50")}>
                    <AdminTd>
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff] text-[#4338ca]">
                          <Cpu className="h-4 w-4" />
                        </span>
                        <span className="font-semibold text-[#191970]">{m.name}</span>
                      </div>
                    </AdminTd>
                    <AdminTd>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset",
                          providerColors[m.provider.toLowerCase()] ?? "bg-slate-100 text-slate-700 ring-slate-200/60",
                        )}
                      >
                        {m.provider}
                      </span>
                    </AdminTd>
                    <AdminTd>
                      <code className="rounded-md bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700 ring-1 ring-slate-100">
                        {m.modelId}
                      </code>
                    </AdminTd>
                    <AdminTd>
                      <code className="font-mono text-xs tracking-wider text-slate-500">{m.apiKeyMasked}</code>
                    </AdminTd>
                    <AdminTd className="font-medium text-slate-700">{formatCount(m.usageCount)}</AdminTd>
                    <AdminTd>
                      <StatusBadge label={m.enabled ? "Enabled" : "Disabled"} tone={m.enabled ? "success" : "neutral"} />
                    </AdminTd>
                    <AdminTd>
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onToggle(m)}
                          disabled={busyId === m.id}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                        >
                          {m.enabled ? "Disable" : "Enable"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(m)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(m)}
                          className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </AdminTd>
                  </AdminTr>
                ))
              )}
            </AdminTbody>
          </AdminTable>
        </AdminTableWrap>
      </AdminPanel>

      <AdminModal
        open={modal !== null}
        title={modal === "create" ? "Add AI model" : "Edit AI model"}
        description="Credentials are encrypted at rest. Only masked values appear in the admin UI."
        onClose={() => setModal(null)}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          {formError ? (
            <p role="alert" className="rounded-xl border border-rose-200/80 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">
              {formError}
            </p>
          ) : null}
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Display name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={cn(adminInputClass, "mt-1.5")}
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Provider</span>
            <input
              required
              value={form.provider}
              onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
              placeholder="openai, anthropic, google…"
              className={cn(adminInputClass, "mt-1.5")}
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Model ID</span>
            <input
              required
              value={form.modelId}
              onChange={(e) => setForm((f) => ({ ...f, modelId: e.target.value }))}
              className={cn(adminInputClass, "mt-1.5 font-mono")}
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">
              API key {modal === "edit" ? "(leave blank to keep current)" : ""}
            </span>
            <input
              type="password"
              value={form.apiKey}
              onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
              required={modal === "create"}
              className={cn(adminInputClass, "mt-1.5 font-mono")}
            />
          </label>
          <label className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3 text-sm">
            <input
              type="checkbox"
              checked={form.enabled ?? true}
              onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-[#2277FF]"
            />
            <span className="font-medium text-slate-700">Enabled for platform-wide use</span>
          </label>
          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
            <AdminBtnSecondary type="button" onClick={() => setModal(null)}>
              Cancel
            </AdminBtnSecondary>
            <AdminBtnPrimary type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save model"}
            </AdminBtnPrimary>
          </div>
        </form>
      </AdminModal>
    </SuperAdminAppShell>
  );
}
