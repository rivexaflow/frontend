"use client";

import { workspaceStore } from "@/stores/workspace.store";

export function WorkspaceSwitcher() {
  const { workspaceName, workspaceSlug, plan } = workspaceStore();
  if (!workspaceSlug) return null;
  return (
    <div className="rounded-md border border-[var(--rvx-midnight)]/15 bg-[var(--rvx-lavender)] px-3 py-2 text-xs text-[var(--rvx-midnight)]">
      <p className="font-semibold">{workspaceName ?? "Workspace"}</p>
      <p className="text-[var(--rvx-midnight)]/70">
        {workspaceSlug} · {plan ?? "Plan"}
      </p>
    </div>
  );
}
