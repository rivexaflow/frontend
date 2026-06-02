"use client";

import { cn } from "@/lib/utils/cn";
import { roleBadgeTone } from "@/features/workspace/data/workspace-user-roles";

const toneClass: Record<ReturnType<typeof roleBadgeTone>, string> = {
  blue: "border-blue-200/80 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300",
  indigo: "border-indigo-200/80 bg-indigo-50 text-indigo-800 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300",
  emerald:
    "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
  amber: "border-amber-200/80 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200",
  purple:
    "border-violet-200/80 bg-violet-50 text-violet-800 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-300",
  slate: "border-slate-200/80 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

type Props = {
  role: string;
  className?: string;
  size?: "sm" | "md";
};

export function UserRoleBadge({ role, className, size = "sm" }: Props) {
  const tone = roleBadgeTone(role);
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full border font-semibold",
        size === "sm" ? "px-2.5 py-0.5 text-[10px] tracking-wide" : "px-3 py-1 text-xs",
        toneClass[tone],
        className,
      )}
    >
      <span className="truncate">{role}</span>
    </span>
  );
}
