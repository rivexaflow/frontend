"use client";

import { useState } from "react";
import { CheckCircle2, Phone } from "lucide-react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import {
  CALL_DISPOSITION_META,
  type CallDisposition,
} from "@/features/workspace/data/crm-dialer-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  contactName: string;
  phone: string;
  onClose: () => void;
  onSubmit: (disposition: CallDisposition, notes?: string) => void;
  onSaveOnly: (disposition: CallDisposition, notes?: string) => void;
  initialNotes?: string;
};

const DISPOSITION_ORDER: CallDisposition[] = [
  "connected",
  "callback",
  "voicemail",
  "no_answer",
  "busy",
  "wrong_number",
  "not_interested",
];

const DISPOSITION_ICON_TONE: Record<CallDisposition, string> = {
  connected: "border-emerald-200 bg-emerald-50 text-emerald-700",
  callback: "border-blue-200 bg-blue-50 text-blue-700",
  voicemail: "border-indigo-200 bg-indigo-50 text-indigo-700",
  no_answer: "border-slate-200 bg-slate-50 text-slate-600",
  busy: "border-amber-200 bg-amber-50 text-amber-700",
  wrong_number: "border-rose-200 bg-rose-50 text-rose-700",
  not_interested: "border-rose-200 bg-rose-50 text-rose-700",
};

export function DialerDispositionModal({
  open,
  contactName,
  phone,
  onClose,
  onSubmit,
  onSaveOnly,
  initialNotes = "",
}: Props) {
  const [selected, setSelected] = useState<CallDisposition>("connected");
  const [notes, setNotes] = useState(initialNotes);


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="disposition-title"
        className="relative z-[1] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="bg-gradient-to-br from-[#191970] to-[#12124a] px-5 py-5 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">Wrap up call</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <h2 id="disposition-title" className="text-lg font-semibold">
                {contactName}
              </h2>
              <p className="font-mono text-sm text-white/60">{phone}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Select outcome</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DISPOSITION_ORDER.map((d) => {
              const meta = CALL_DISPOSITION_META[d];
              const isSelected = selected === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelected(d)}
                  className={cn(
                    "relative rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition",
                    isSelected
                      ? "border-[#191970] bg-[#191970]/5 text-[#191970] ring-2 ring-[#191970]/20"
                      : cn("hover:border-slate-300", DISPOSITION_ICON_TONE[d]),
                  )}
                >
                  {isSelected ? (
                    <CheckCircle2 className="absolute right-2 top-2 h-3.5 w-3.5 text-[#191970]" />
                  ) : null}
                  {meta.label}
                </button>
              );
            })}
          </div>

          <label
            htmlFor="disposition-notes"
            className="mt-4 block text-xs font-bold uppercase tracking-wide text-slate-400"
          >
            Notes
          </label>
          <textarea
            id="disposition-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Next steps, objections, follow-up date…"
            className={cn(crm.input, "mt-2 h-auto min-h-[80px] w-full resize-y py-2")}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40">
          <button
            type="button"
            onClick={() => onSaveOnly(selected, notes.trim() || undefined)}
            className={crm.btnSecondarySm}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => onSubmit(selected, notes.trim() || undefined)}
            className={cn(crm.btnPrimarySm, "min-w-[140px] shadow-md shadow-[#191970]/20")}
          >
            Save &amp; next lead
          </button>
        </div>
      </div>
    </div>
  );
}
