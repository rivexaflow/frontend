"use client";

import { Calendar, Clock, Video } from "lucide-react";

import type { HrmScheduleEvent } from "@/features/workspace/data/hrm-dashboard-demo";
import { cn } from "@/lib/utils/cn";

function groupByDate(events: HrmScheduleEvent[]) {
  const map = new Map<number, HrmScheduleEvent[]>();
  for (const e of events) {
    const list = map.get(e.date) ?? [];
    list.push(e);
    map.set(e.date, list);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a - b);
}

function formatDay(date: number) {
  const d = new Date(2026, 5, date);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type Props = {
  events: HrmScheduleEvent[];
  onJoinMeeting?: (event: HrmScheduleEvent) => void;
};

export function RecruitmentInterviewsPanel({ events, onJoinMeeting }: Props) {
  const grouped = groupByDate(events);

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center dark:border-slate-700">
        <Calendar className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-600">No interviews scheduled</p>
        <p className="mt-1 text-xs text-slate-400">Move candidates to Interviewed to book slots</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([date, dayEvents]) => (
        <div key={date}>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#191970]/10 text-xs font-bold text-[#191970]">
              {date}
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{formatDay(date)}</h3>
            <span className="text-xs text-slate-400">
              {dayEvents.length} session{dayEvents.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="space-y-2">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between",
                  "dark:border-slate-800 dark:bg-slate-900",
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#191970] to-[#2277ff] text-xs font-bold text-white">
                    {initials(event.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">{event.name}</p>
                    <p className="mt-0.5 text-xs text-[#2277ff]">{event.role}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{event.bio}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800">
                    <Clock className="h-3.5 w-3.5" />
                    {event.time}
                  </span>
                  {event.meetingUrl ? (
                    <button
                      type="button"
                      onClick={() => onJoinMeeting?.(event)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#191970] px-3 text-xs font-semibold text-white hover:bg-[#12124a]"
                    >
                      <Video className="h-3.5 w-3.5" />
                      Join
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
