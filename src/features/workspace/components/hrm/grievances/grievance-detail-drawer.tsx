"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Image as ImageIcon, Send, Shield, User, X } from "lucide-react";
import { FormEvent, useState } from "react";

import { GrievanceStatusTracker } from "@/features/workspace/components/hrm/grievances/grievance-status-tracker";
import { StatusPill } from "@/features/workspace/components/hrm/hrm-module-table";
import {
  GRIEVANCE_STAGES,
  displayEmployee,
  type GrievanceComment,
  type GrievanceStage,
  type HrmGrievanceTicket,
} from "@/features/workspace/data/hrm-grievances-demo";
import { cn } from "@/lib/utils/cn";

const PRIORITY_TONE: Record<HrmGrievanceTicket["priority"], "default" | "warning" | "danger"> = {
  low: "default",
  medium: "warning",
  high: "danger",
};

const ROLE_STYLE: Record<GrievanceComment["role"], string> = {
  employee: "bg-slate-100 text-slate-700",
  hr: "bg-[#191970]/10 text-[#191970]",
  manager: "bg-emerald-50 text-emerald-800",
};

type Props = {
  ticket: HrmGrievanceTicket | null;
  onClose: () => void;
  onAddComment: (ticketId: string, body: string) => void;
  onAdvanceStage: (ticketId: string, stage: GrievanceStage) => void;
};

export function GrievanceDetailDrawer({ ticket, onClose, onAddComment, onAdvanceStage }: Props) {
  const [message, setMessage] = useState("");

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!ticket || !message.trim()) return;
    onAddComment(ticket.id, message.trim());
    setMessage("");
  };

  const stageIdx = ticket ? GRIEVANCE_STAGES.findIndex((s) => s.id === ticket.stage) : -1;
  const nextStage = ticket && stageIdx >= 0 && stageIdx < GRIEVANCE_STAGES.length - 1
    ? GRIEVANCE_STAGES[stageIdx + 1]
    : null;

  return (
    <AnimatePresence>
      {ticket ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px]"
            aria-label="Close grievance panel"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#191970]">{ticket.id}</span>
                  {ticket.anonymous ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold">
                      <Shield className="h-3 w-3" />
                      Anonymous
                    </span>
                  ) : null}
                  <StatusPill label={ticket.priority} tone={PRIORITY_TONE[ticket.priority]} />
                </div>
                <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{ticket.subject}</h2>
                <p className="mt-0.5 text-xs text-slate-500">{ticket.category} · Filed {ticket.filedAt}</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <section className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Your progress</p>
                <div className="mt-3">
                  <GrievanceStatusTracker stage={ticket.stage} />
                </div>
                {nextStage ? (
                  <button
                    type="button"
                    onClick={() => onAdvanceStage(ticket.id, nextStage.id)}
                    className="mt-3 w-full rounded-lg border border-[#191970]/20 bg-white py-2 text-xs font-semibold text-[#191970] hover:bg-[#191970]/5"
                  >
                    Advance to {nextStage.label} (demo)
                  </button>
                ) : null}
              </section>

              <section className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Details</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{ticket.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {displayEmployee(ticket)} · {ticket.department}
                  </span>
                  {ticket.assignedTo ? (
                    <span>Assigned to {ticket.assignedTo}</span>
                  ) : (
                    <span className="text-amber-600">Awaiting assignment</span>
                  )}
                  <span>{ticket.language}</span>
                </div>
              </section>

              {ticket.evidence.length > 0 ? (
                <section className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Evidence</p>
                  <ul className="mt-2 space-y-2">
                    {ticket.evidence.map((f) => (
                      <li
                        key={f.id}
                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        {f.mime.startsWith("image/") ? (
                          <ImageIcon className="h-4 w-4 text-sky-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-[#191970]" />
                        )}
                        <span className="flex-1 truncate font-medium">{f.name}</span>
                        <span className="text-xs text-slate-400">{f.sizeLabel}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Conversation</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Messages here go directly to the assigned HR officer — we'll notify you when they reply.
                </p>
                <ul className="mt-3 space-y-3">
                  {ticket.comments.map((c) => (
                    <li key={c.id} className="rounded-xl border border-slate-200/80 bg-white p-3 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900">{c.author}</span>
                        <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase", ROLE_STYLE[c.role])}>
                          {c.role}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.body}</p>
                      <p className="mt-2 text-[10px] text-slate-400">{c.at}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <form onSubmit={handleSend} className="border-t border-slate-100 p-4 dark:border-slate-800">
              <label htmlFor="grievance-reply" className="sr-only">
                Reply to HR
              </label>
              <div className="flex gap-2">
                <input
                  id="grievance-reply"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message to HR…"
                  className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/15"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="inline-flex h-10 items-center gap-1 rounded-lg bg-[#191970] px-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </form>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
