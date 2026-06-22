"use client";

import { Lock, Shield, Users } from "lucide-react";

import type { HrmRoleRecord } from "@/features/workspace/data/hrm-roles-demo";
import { HRM_PERMISSION_CATEGORIES } from "@/features/workspace/data/hrm-permissions-catalog";
import { cn } from "@/lib/utils/cn";

const SCOPE_LABEL = {
  organization: "Organization",
  department: "Department",
  self: "Self only",
} as const;

const ACCENTS = [
  "from-[#191970] to-[#2277ff]",
  "from-emerald-600 to-teal-500",
  "from-[#0056ff] to-sky-500",
  "from-amber-500 to-orange-500",
  "from-slate-600 to-slate-800",
  "from-rose-500 to-pink-500",
];

function accentFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % ACCENTS.length;
  return ACCENTS[hash] ?? ACCENTS[0]!;
}

type Props = {
  role: HrmRoleRecord;
  selected: boolean;
  onSelect: () => void;
};

export function HrmRoleCard({ role, selected, onSelect }: Props) {
  const accent = accentFor(role.id);
  const categories = HRM_PERMISSION_CATEGORIES.filter((cat) =>
    role.permissionKeys.some((k) => k.startsWith(`${cat.id}.`)),
  );

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group relative flex min-h-[220px] cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.05)] transition-all duration-200",
        selected
          ? "border-[#191970]/40 ring-2 ring-[#191970]/15"
          : "border-slate-200/80 hover:-translate-y-1 hover:border-[#2277ff]/30 hover:shadow-[0_16px_40px_rgba(25,25,112,0.08)]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
            accent,
          )}
        >
          <Shield className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {role.isSystem ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#191970]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#191970]">
              <Lock className="h-3 w-3" />
              System
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Custom
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 min-w-0 flex-1">
        <h3 className="text-base font-bold text-slate-900">{role.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {role.description ?? "No description"}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {categories.slice(0, 4).map((cat) => (
          <span
            key={cat.id}
            className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200/80"
          >
            {cat.label}
          </span>
        ))}
        {categories.length > 4 ? (
          <span className="text-[10px] font-semibold text-slate-400">+{categories.length - 4}</span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {role.memberCount} members
        </span>
        <span>{SCOPE_LABEL[role.scope]}</span>
        <span className="font-bold tabular-nums text-[#191970]">{role.permissionKeys.length} perms</span>
      </div>
    </article>
  );
}
