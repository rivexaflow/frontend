"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type { LeadBoardStage } from "@/features/workspace/data/crm-demo";
import { cn } from "@/lib/utils/cn";

const TONES: LeadBoardStage["tone"][] = ["blue", "amber", "emerald", "slate", "rose"];

type Props = {
  open: boolean;
  existingIds: string[];
  onClose: () => void;
  onCreate: (stage: LeadBoardStage) => void;
};

const inputClass =
  "mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/15 dark:border-slate-700 dark:bg-slate-950";

export function LeadsCreateStageModal({ open, existingIds, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [tone, setTone] = useState<LeadBoardStage["tone"]>("blue");

  useEffect(() => {
    if (open) {
      setName("");
      setTone("blue");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    let id = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
    if (!id) id = `stage_${Date.now()}`;
    let uniqueId = id;
    let n = 2;
    while (existingIds.includes(uniqueId)) {
      uniqueId = `${id}_${n}`;
      n += 1;
    }

    onCreate({ id: uniqueId, name: trimmed, tone });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-lead-stage-title"
        className="relative z-[1] w-full max-w-md overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 id="create-lead-stage-title" className="text-base font-semibold text-slate-900 dark:text-white">
              Create pipeline stage
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">Adds a new column to your leads board.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="px-5 py-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Stage name</span>
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Follow-up scheduled"
            />
          </label>

          <fieldset className="mt-4">
            <legend className="text-xs font-semibold text-slate-600">Column accent</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition",
                    tone === t
                      ? "border-[#191970] bg-[#191970]/10 text-[#191970]"
                      : "border-slate-200 text-slate-600 hover:border-slate-300",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#191970] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12124a]"
            >
              Create stage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
