"use client";

import { Plus, Search } from "lucide-react";

import type { WorkspaceUserRecord } from "@/features/workspace/data/workspace-users-demo";
import { cn } from "@/lib/utils/cn";

const BRAND = "#191970";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type Props = {
  users: WorkspaceUserRecord[];
  query: string;
  onQueryChange: (q: string) => void;
  onInvite: () => void;
  stats: { total: number; active: number; invited: number; mfaPct: number };
};

export function MemberDirectoryHero({ users, query, onQueryChange, onInvite, stats }: Props) {
  const spotlight = users.slice(0, 6);

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[#141452] shadow-sm"
      style={{ backgroundColor: BRAND }}
    >
      <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-white/70">Governance · User management</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[1.65rem]">
            Workspace members
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/75">
            Manage who can access your workspace, their profile roles, and module permissions.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-white/15 pt-5">
            {[
              { label: "Total", value: stats.total },
              { label: "Active", value: stats.active },
              { label: "Invited", value: stats.invited },
              { label: "MFA coverage", value: `${stats.mfaPct}%` },
            ].map((item) => (
              <div key={item.label} className="min-w-[4.5rem]">
                <p className="text-[11px] font-medium text-white/60">{item.label}</p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 lg:max-w-md lg:items-end">
          <div className="flex items-center gap-0">
            {spotlight.map((user, i) => (
              <div
                key={user.id}
                title={user.name}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#191970] bg-white/15 text-[10px] font-semibold text-white",
                  i > 0 && "-ml-2.5",
                )}
                style={{ zIndex: spotlight.length - i }}
              >
                {initials(user.name)}
              </div>
            ))}
            <button
              type="button"
              onClick={onInvite}
              className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-white/35 bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Invite member"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex w-full items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search name, email, or role"
                className="h-10 w-full rounded-lg border border-white/20 bg-white/10 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/10"
              />
            </div>
            <button
              type="button"
              onClick={onInvite}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-white px-4 text-sm font-semibold text-[#191970] transition hover:bg-slate-100"
            >
              <Plus className="h-4 w-4" />
              Invite
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
