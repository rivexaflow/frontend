"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Video, X } from "lucide-react";
import Link from "next/link";

import {
  HRM_SCHEDULE_EVENTS,
  buildScheduleWeek,
  formatScheduleMonth,
  type HrmScheduleEvent,
} from "@/features/workspace/data/hrm-dashboard-demo";
import { workspacePaths } from "@/lib/workspace/paths";
import { cn } from "@/lib/utils/cn";

type Props = {
  weekOffset: number;
  selectedDate: number;
  onWeekChange: (offset: number) => void;
  onSelectDate: (date: number) => void;
};

export function HrmDashboardSchedule({
  weekOffset,
  selectedDate,
  onWeekChange,
  onSelectDate,
}: Props) {
  const [tab, setTab] = useState<"interview" | "meeting">("interview");
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [meetingOpen, setMeetingOpen] = useState(false);

  const days = useMemo(
    () => buildScheduleWeek(weekOffset, selectedDate),
    [weekOffset, selectedDate],
  );

  const monthLabel = formatScheduleMonth(weekOffset);

  const dayEvents = useMemo(
    () =>
      HRM_SCHEDULE_EVENTS.filter((e) => e.date === selectedDate).sort((a, b) =>
        a.time.localeCompare(b.time),
      ),
    [selectedDate],
  );

  const filtered = useMemo(
    () => dayEvents.filter((e) => e.kind === tab),
    [dayEvents, tab],
  );

  const interviewCount = dayEvents.filter((e) => e.kind === "interview").length;
  const meetingCount = dayEvents.filter((e) => e.kind === "meeting").length;

  const activeEvent = activeEventId
    ? HRM_SCHEDULE_EVENTS.find((e) => e.id === activeEventId)
    : filtered.find((e) => e.id === activeEventId) ?? filtered[0];

  const handleGoToMeeting = (event: HrmScheduleEvent) => {
    setActiveEventId(event.id);
    setMeetingOpen(true);
  };

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100/80 px-5 py-4 dark:border-slate-800">
        <h3 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">Schedule</h3>
        <Link href={workspacePaths.hrmRecruitment} className="text-xs font-semibold text-[#2277ff] hover:underline">
          See all
        </Link>
      </div>

      <div className="border-b border-slate-100/80 px-4 py-4 dark:border-slate-800">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onWeekChange(weekOffset - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{monthLabel}</span>
          <button
            type="button"
            onClick={() => onWeekChange(weekOffset + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex justify-between gap-1" role="tablist" aria-label="Week days">
          {days.map((day) => {
            const hasEvents = HRM_SCHEDULE_EVENTS.some((e) => e.date === day.date);
            const isSelected = day.date === selectedDate;
            return (
              <button
                key={`${weekOffset}-${day.date}`}
                type="button"
                onClick={() => onSelectDate(day.date)}
                className={cn(
                  "relative flex min-w-0 flex-1 flex-col items-center rounded-xl py-2 text-center transition",
                  isSelected
                    ? "bg-[#2277ff] text-white shadow-md shadow-[#2277ff]/25"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50",
                )}
                aria-pressed={isSelected}
              >
                <span className="text-[10px] font-medium uppercase">{day.weekday}</span>
                <span className={cn("mt-0.5 text-sm font-bold tabular-nums", isSelected && "text-white")}>
                  {String(day.date).padStart(2, "0")}
                </span>
                {hasEvents ? (
                  <span
                    className={cn(
                      "mt-1 h-1 w-1 rounded-full",
                      isSelected ? "bg-white" : "bg-[#2277ff]",
                    )}
                    aria-hidden
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex border-b border-slate-100/80 px-4 dark:border-slate-800" role="tablist">
        {(
          [
            { id: "interview" as const, label: "Interview", count: interviewCount },
            { id: "meeting" as const, label: "Meeting", count: meetingCount },
          ] as const
        ).map(({ id, label, count }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "relative flex-1 py-3 text-center text-xs font-semibold transition",
              tab === id ? "text-[#2277ff]" : "text-slate-400 hover:text-slate-600",
            )}
          >
            {label} ({count})
            {tab === id ? (
              <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[#2277ff]" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No {tab}s on this day.</p>
        ) : (
          <ol className="relative space-y-0">
            {filtered.map((event, index) => {
              const isActive = activeEventId === event.id || (!activeEventId && index === 0);
              return (
                <li key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
                  {index < filtered.length - 1 ? (
                    <span className="absolute left-[19px] top-10 bottom-0 w-px bg-slate-200 dark:bg-slate-700" aria-hidden />
                  ) : null}
                  <time className="w-10 shrink-0 pt-1 text-xs font-semibold tabular-nums text-slate-400">
                    {event.time}
                  </time>
                  <article
                    className={cn(
                      "min-w-0 flex-1 cursor-pointer rounded-xl border p-3.5 transition",
                      isActive
                        ? "border-[#2277ff]/40 bg-[#2277ff]/[0.06] shadow-sm"
                        : "border-slate-100 bg-slate-50/50 hover:border-[#2277ff]/20 dark:border-slate-800 dark:bg-slate-950/40",
                    )}
                    onClick={() => setActiveEventId(event.id)}
                    onKeyDown={(e) => e.key === "Enter" && setActiveEventId(event.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#191970] to-[#2277ff] text-xs font-bold text-white">
                        {event.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{event.name}</p>
                        <p className="text-xs font-medium text-[#2277ff]">{event.role}</p>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{event.bio}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGoToMeeting(event);
                          }}
                          className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-[#2277ff] px-4 text-xs font-semibold text-white transition hover:bg-[#0056ff]"
                        >
                          <Video className="h-3.5 w-3.5" />
                          Go to meeting
                        </button>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {meetingOpen && activeEvent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
            role="dialog"
            aria-labelledby="meeting-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 id="meeting-title" className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeEvent.name}
                </h4>
                <p className="mt-1 text-sm text-[#2277ff]">{activeEvent.role}</p>
              </div>
              <button
                type="button"
                onClick={() => setMeetingOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-600">{activeEvent.bio}</p>
            <p className="mt-2 text-xs text-slate-400">
              Scheduled {String(selectedDate).padStart(2, "0")} Jun 2026 at {activeEvent.time}
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href={activeEvent.meetingUrl ?? "#"}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2277ff] py-2.5 text-sm font-semibold text-white hover:bg-[#0056ff]"
              >
                <Video className="h-4 w-4" />
                Join now
              </a>
              <button
                type="button"
                onClick={() => setMeetingOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
