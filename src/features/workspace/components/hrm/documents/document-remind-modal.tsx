"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bell, CheckSquare, Loader2, Search, Square, Users } from "lucide-react";

import {
  EnterpriseFormModal,
  FormField,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import { SubmissionBadge } from "@/features/workspace/components/hrm/documents/document-submission-badge";
import {
  buildDefaultRemindMessage,
  isReminderEligible,
  personalizeRemindMessage,
} from "@/features/workspace/data/hrm-documents-ui";
import { initials } from "@/features/workspace/data/hrm-assets-demo";
import type { EmployeeDocumentSubmission, HrmDocumentTypeCard } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  type: HrmDocumentTypeCard | null;
  submissions: EmployeeDocumentSubmission[];
  sending: boolean;
  onClose: () => void;
  onSend: (payload: { employeeIds: string[]; message: string }) => Promise<void>;
};

export function DocumentRemindModal({
  open,
  type,
  submissions,
  sending,
  onClose,
  onSend,
}: Props) {
  const eligible = useMemo(
    () => submissions.filter(isReminderEligible),
    [submissions],
  );

  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !type) return;
    setQuery("");
    setError(null);
    setMessage(buildDefaultRemindMessage(type.title));
    setSelectedIds(
      new Set(submissions.filter(isReminderEligible).map((row) => row.employeeId)),
    );
  }, [open, type, submissions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return eligible;
    return eligible.filter((row) =>
      `${row.employeeName} ${row.employeeCode} ${row.department} ${row.location}`
        .toLowerCase()
        .includes(q),
    );
  }, [eligible, query]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((row) => selectedIds.has(row.employeeId));

  const previewEmployee =
    eligible.find((row) => selectedIds.has(row.employeeId)) ?? eligible[0] ?? null;

  const toggleAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        for (const row of filtered) next.delete(row.employeeId);
      } else {
        for (const row of filtered) next.add(row.employeeId);
      }
      return next;
    });
  };

  const toggleOne = (employeeId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(employeeId)) next.delete(employeeId);
      else next.add(employeeId);
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!type) return;
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Notification message is required.");
      return;
    }
    if (selectedIds.size === 0) {
      setError("Select at least one employee to notify.");
      return;
    }
    setError(null);
    try {
      await onSend({ employeeIds: [...selectedIds], message: trimmed });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reminders.");
    }
  };

  return (
    <EnterpriseFormModal
      open={open}
      title="Send document reminders"
      description={
        type
          ? `Notify employees who still need to submit "${type.title}". Each person receives the message below with their name.`
          : undefined
      }
      onClose={onClose}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Users className="h-4 w-4 text-[#191970]" />
                Recipients
                <span className="rounded-full bg-[#191970]/10 px-2 py-0.5 text-xs font-bold text-[#191970]">
                  {selectedIds.size} selected
                </span>
              </div>
              <button
                type="button"
                onClick={toggleAllFiltered}
                disabled={filtered.length === 0}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2277ff] hover:underline disabled:opacity-40"
              >
                {allFilteredSelected ? (
                  <>
                    <Square className="h-3.5 w-3.5" />
                    Deselect visible
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-3.5 w-3.5" />
                    Select all visible
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, ID, department…"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/10"
              />
            </div>

            <div className="max-h-[280px] overflow-y-auto rounded-xl border border-slate-200/80 bg-slate-50/50">
              {eligible.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-500">
                  Everyone has submitted this document — no reminders needed.
                </p>
              ) : filtered.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-500">
                  No employees match your search.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filtered.map((row) => {
                    const checked = selectedIds.has(row.employeeId);
                    return (
                      <li key={row.employeeId}>
                        <label
                          className={cn(
                            "flex cursor-pointer items-center gap-3 px-3 py-2.5 transition hover:bg-white",
                            checked && "bg-white",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleOne(row.employeeId)}
                            className="h-4 w-4 rounded border-slate-300 text-[#191970] focus:ring-[#191970]/20"
                          />
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#191970]/10 text-xs font-bold text-[#191970]">
                            {initials(row.employeeName)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-900">
                              {row.employeeName}
                            </span>
                            <span className="block truncate text-xs text-slate-500">
                              {row.employeeCode} · {row.department}
                            </span>
                          </span>
                          <SubmissionBadge status={row.status} />
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <FormField label="Notification message" htmlFor="remind-message">
              <textarea
                id="remind-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={10}
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/10"
                placeholder="Write the reminder employees will receive…"
              />
            </FormField>
            <p className="text-xs text-slate-500">
              Use <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px]">{"{{name}}"}</code>{" "}
              to insert each employee&apos;s first name automatically.
            </p>

            {previewEmployee ? (
              <div className="rounded-xl border border-[#2277ff]/15 bg-[#2277ff]/[0.04] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Preview for {previewEmployee.employeeName}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
                  {personalizeRemindMessage(message, previewEmployee.employeeName)}
                </p>
              </div>
            ) : null}
          </section>
        </div>

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500">
            {eligible.length} employee{eligible.length === 1 ? "" : "s"} eligible ·{" "}
            {selectedIds.size} will be notified
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || selectedIds.size === 0 || eligible.length === 0}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#191970] px-5 text-sm font-semibold text-white hover:bg-[#12124a] disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  Send to {selectedIds.size} employee{selectedIds.size === 1 ? "" : "s"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
