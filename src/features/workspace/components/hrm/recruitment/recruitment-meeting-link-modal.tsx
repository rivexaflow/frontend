"use client";

import { Video, X } from "lucide-react";

type Props = {
  open: boolean;
  name: string;
  role: string;
  bio?: string;
  scheduledLabel: string;
  meetingUrl: string;
  onClose: () => void;
};

export function RecruitmentMeetingLinkModal({
  open,
  name,
  role,
  bio,
  scheduledLabel,
  meetingUrl,
  onClose,
}: Props) {
  if (!open) return null;

  const href = meetingUrl.startsWith("http") ? meetingUrl : `https://${meetingUrl}`;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        role="dialog"
        aria-labelledby="recruitment-meeting-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 id="recruitment-meeting-title" className="text-lg font-bold text-slate-900 dark:text-white">
              {name}
            </h4>
            <p className="mt-1 text-sm text-[#2277ff]">{role}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {bio ? <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{bio}</p> : null}
        <p className="mt-2 text-xs text-slate-400">{scheduledLabel}</p>
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Google Meet</p>
          <p className="mt-0.5 truncate text-xs font-medium text-[#191970] dark:text-indigo-300">{href}</p>
        </div>
        <div className="mt-5 flex gap-2">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2277ff] py-2.5 text-sm font-semibold text-white hover:bg-[#0056ff]"
          >
            <Video className="h-4 w-4" />
            Join now
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
