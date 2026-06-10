"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
  selectClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import {
  HrmDirectoryViewToggle,
  type HrmViewMode,
} from "@/features/workspace/components/hrm/hrm-directory-view-toggle";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import {
  HRM_EVENT_STATUSES,
  HRM_EVENT_TYPES,
  type HrmEventRecord,
  type HrmEventStatus,
  type HrmEventType,
} from "@/features/workspace/data/hrm-events-demo";
import type { CreateEventPayload, HrmEventDetail } from "@/types/hrm";
import {
  createHrEvent,
  fetchHrEvent,
  fetchHrEvents,
  updateHrEventStatus,
} from "@/lib/api/hrm";
import { cn } from "@/lib/utils/cn";

type Filters = { query: string; type: HrmEventType | ""; status: HrmEventStatus | "" };

const STATUS_STYLES: Record<HrmEventStatus, string> = {
  draft: "bg-slate-100 text-slate-600 ring-slate-500/15",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  completed: "bg-sky-50 text-sky-700 ring-sky-600/15",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-600/15",
};

function EventStatusBadge({ status }: { status: HrmEventStatus }) {
  const label = HRM_EVENT_STATUSES.find((s) => s.id === status)?.label ?? status;
  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", STATUS_STYLES[status])}>
      {label}
    </span>
  );
}

export function HrmEventsView() {
  const companyId = useHrCompanyId();
  const [events, setEvents] = useState<HrmEventRecord[]>([]);
  const [filters, setFilters] = useState<Filters>({ query: "", type: "", status: "" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<HrmViewMode>("grid");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const list = await fetchHrEvents(companyId, {
        type: filters.type || undefined,
        status: filters.status || undefined,
      });
      setEvents(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load events.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId, filters.type, filters.status]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => `${e.title} ${e.organizer} ${e.location}`.toLowerCase().includes(q));
  }, [events, filters.query]);

  const selected = selectedId ? events.find((e) => e.id === selectedId) ?? null : null;
  const publishedCount = events.filter((e) => e.status === "published").length;
  const totalRsvp = events.reduce((s, e) => s + e.rsvpYes, 0);

  const handleRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const updateStatus = async (id: string, status: HrmEventStatus) => {
    if (!companyId) return;
    try {
      const updated = await updateHrEventStatus(companyId, id, status);
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update event status.");
    }
  };

  const handleCreate = async (payload: CreateEventPayload) => {
    if (!companyId) return;
    const created = await createHrEvent(companyId, payload);
    setEvents((prev) => [created, ...prev]);
    setSelectedId(created.id);
  };

  return (
    <div className="pb-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">People · HRM</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Events</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Town halls, training, socials, and company calendar with RSVP tracking.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Total", value: events.length, icon: Calendar },
              { label: "Published", value: publishedCount, icon: UserCheck },
              { label: "RSVPs", value: totalRsvp, icon: Users },
              { label: "Upcoming", value: publishedCount, icon: Clock },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <stat.icon className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">{stat.label}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{stat.value}</span>
              </div>
            ))}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {error ? (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-3 border-b border-slate-200/90 px-4 py-4 dark:border-slate-800">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1 lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={filters.query}
                onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
                placeholder="Search events…"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <select
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value as Filters["type"] }))}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">All types</option>
              {HRM_EVENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as Filters["status"] }))}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">All statuses</option>
              {HRM_EVENT_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <div className="flex items-center gap-2 lg:ml-auto">
              <HrmDirectoryViewToggle viewMode={viewMode} onChange={setViewMode} />
              <span className="text-xs text-slate-500">
                <span className="font-semibold tabular-nums text-slate-800">{filtered.length}</span> events
              </span>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white hover:bg-[#12124a]"
              >
                <Plus className="h-4 w-4" />
                Create event
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading events…
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => setSelectedId(event.id)}
                className={cn(
                  "rounded-xl border bg-white p-4 text-left shadow-sm transition dark:bg-slate-900",
                  selectedId === event.id ? "border-[#191970] ring-1 ring-[#191970]/25" : "border-slate-200/90 hover:border-slate-300",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-900 dark:text-white">{event.title}</p>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </div>
                <p className="mt-1 text-xs text-slate-500">{HRM_EVENT_TYPES.find((t) => t.id === event.type)?.label}</p>
                <p className="mt-2 text-sm text-slate-600">{event.date} · {event.time}</p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-xs text-slate-500">{event.rsvpYes} RSVPs</span>
                  <EventStatusBadge status={event.status} />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">RSVP</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((event) => (
                <tr key={event.id} onClick={() => setSelectedId(event.id)} className="cursor-pointer hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-900">{event.title}</td>
                  <td className="px-4 py-3 text-slate-600">{event.date}</td>
                  <td className="px-4 py-3 text-slate-500">{event.location}</td>
                  <td className="px-4 py-3 tabular-nums">{event.rsvpYes}/{event.capacity || "—"}</td>
                  <td className="px-4 py-3"><EventStatusBadge status={event.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {selected && companyId ? (
          <EventDetailPanel
            companyId={companyId}
            event={selected}
            onClose={() => setSelectedId(null)}
            onUpdateStatus={(status) => void updateStatus(selected.id, status)}
            onEventUpdated={(updated) => setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))}
          />
        ) : null}
      </AnimatePresence>

      <CreateEventModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}

function EventDetailPanel({
  companyId,
  event,
  onClose,
  onUpdateStatus,
  onEventUpdated,
}: {
  companyId: string;
  event: HrmEventRecord;
  onClose: () => void;
  onUpdateStatus: (status: HrmEventStatus) => void;
  onEventUpdated: (event: HrmEventRecord) => void;
}) {
  const [detail, setDetail] = useState<HrmEventDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchHrEvent(companyId, event.id)
      .then((d) => {
        setDetail(d);
        onEventUpdated(d);
      })
      .catch(() => setDetail({ ...event, rsvps: [] }))
      .finally(() => setLoading(false));
  }, [companyId, event.id]);

  const active = detail ?? event;
  const typeLabel = HRM_EVENT_TYPES.find((t) => t.id === active.type)?.label ?? active.type;
  const fillRate = active.capacity > 0 ? Math.round((active.rsvpYes / active.capacity) * 100) : 0;

  return (
    <>
      <motion.button type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} aria-label="Close" />
      <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-[400px] flex-col border-l border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="shrink-0 border-b px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">{active.title}</h2>
              <p className="text-sm text-slate-500">{typeLabel}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-3"><EventStatusBadge status={active.status} /></div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading details…
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600">{active.description}</p>
              <div className="rounded-lg border border-slate-200/90 px-4 text-sm divide-y dark:border-slate-800">
                <div className="flex gap-3 py-2.5"><Calendar className="h-4 w-4 text-slate-400" /><div><p className="text-[10px] uppercase text-slate-400">When</p><p className="font-medium">{active.date} · {active.time}</p></div></div>
                <div className="flex gap-3 py-2.5"><MapPin className="h-4 w-4 text-slate-400" /><div><p className="text-[10px] uppercase text-slate-400">Where</p><p className="font-medium">{active.location}</p></div></div>
                <div className="flex gap-3 py-2.5"><Users className="h-4 w-4 text-slate-400" /><div><p className="text-[10px] uppercase text-slate-400">Organizer</p><p className="font-medium">{active.organizer}</p></div></div>
              </div>
              {active.capacity > 0 ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">RSVP</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900">{active.rsvpYes} yes · {active.rsvpNo} no</span>
                    <span className="text-slate-500">{fillRate}% capacity</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#191970]" style={{ width: `${fillRate}%` }} />
                  </div>
                  {detail?.rsvps?.length ? (
                    <ul className="mt-3 max-h-32 space-y-1 overflow-y-auto text-xs text-slate-600">
                      {detail.rsvps.map((r) => (
                        <li key={r.employeeId} className="flex justify-between">
                          <span>{r.employeeName}</span>
                          <span className={r.response === "yes" ? "text-emerald-600" : "text-slate-400"}>{r.response}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
              {active.status === "draft" ? (
                <button type="button" onClick={() => onUpdateStatus("published")} className="h-10 w-full rounded-lg bg-[#191970] text-sm font-semibold text-white hover:bg-[#12124a]">Publish event</button>
              ) : null}
              {active.status === "published" ? (
                <div className="flex gap-2">
                  <button type="button" onClick={() => onUpdateStatus("completed")} className="h-10 flex-1 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50">Mark completed</button>
                  <button type="button" onClick={() => onUpdateStatus("cancelled")} className="h-10 flex-1 rounded-lg border border-rose-200 bg-rose-50 text-sm font-medium text-rose-700">Cancel</button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </motion.aside>
    </>
  );
}

function CreateEventModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateEventPayload) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<HrmEventType>("town_hall");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00 AM IST");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle("");
      setType("town_hall");
      setDate("");
      setTime("10:00 AM IST");
      setLocation("");
      setDescription("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) {
      setError("Title and date are required.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        type,
        date: date.trim(),
        time: time.trim(),
        location: location.trim() || "TBD",
        organizer: "HR Team",
        capacity: 50,
        description: description.trim() || "New company event — add agenda before publishing.",
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create event.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EnterpriseFormModal open={open} title="Create event" description="Schedule a new company event. Publish when ready to send invites." onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Event title" htmlFor="evt-title">
          <input id="evt-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClassName} placeholder="e.g. Q3 Town Hall" />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Type" htmlFor="evt-type">
            <select id="evt-type" value={type} onChange={(e) => setType(e.target.value as HrmEventType)} className={selectClassName}>
              {HRM_EVENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </FormField>
          <FormField label="Date" htmlFor="evt-date">
            <input id="evt-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClassName} />
          </FormField>
        </div>
        <FormField label="Time" htmlFor="evt-time">
          <input id="evt-time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClassName} placeholder="10:00 AM IST" />
        </FormField>
        <FormField label="Location" htmlFor="evt-loc">
          <input id="evt-loc" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClassName} placeholder="Room, venue, or Zoom link" />
        </FormField>
        <FormField label="Description" htmlFor="evt-desc">
          <textarea id="evt-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputClassName} min-h-[80px] py-2`} />
        </FormField>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-2 border-t pt-4">
          <button type="button" onClick={onClose} className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="submit" disabled={submitting} className="h-10 rounded-lg bg-[#191970] px-5 text-sm font-semibold text-white hover:bg-[#12124a] disabled:opacity-50">
            {submitting ? "Creating…" : "Create draft"}
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
