"use client";

import { socketStore } from "@/stores/socket.store";

export function LiveFeedWidget() {
  const liveFeed = socketStore((s) => s.liveFeed);

  return (
    <section className="rounded-xl border border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-[var(--rvx-midnight)]">Live task feed</p>
      <div className="space-y-2">
        {liveFeed.length === 0 ? (
          <p className="text-sm text-[var(--rvx-midnight)]/60">No activity yet.</p>
        ) : (
          liveFeed.map((item) => (
            <div key={item.id} className="rounded-md bg-[var(--rvx-lavender)] p-2 text-sm">
              <p className="text-[var(--rvx-midnight)]">{item.action}</p>
              <p className="text-xs text-[var(--rvx-midnight)]/70">
                {item.actor} - {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
