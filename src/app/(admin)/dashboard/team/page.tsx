"use client";

import { socketStore } from "@/stores/socket-store";

export default function TeamPage() {
  const statuses = socketStore((s) => s.statuses);
  return (
    <section className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4">
      <h1 className="text-xl font-semibold">Team Management</h1>
      <p className="mt-2 text-sm text-[var(--rvx-midnight)]/70">Invite agents and monitor real-time status.</p>
      <div className="mt-4 space-y-2">
        {statuses.length === 0 ? (
          <p className="text-sm text-[var(--rvx-midnight)]/70">No presence data yet.</p>
        ) : (
          statuses.map((agent) => (
            <div key={agent.userId} className="flex items-center justify-between rounded-md bg-[var(--rvx-lavender)] p-2">
              <span>{agent.name}</span>
              <span className="text-xs uppercase text-[var(--rvx-midnight)]/70">{agent.status}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
