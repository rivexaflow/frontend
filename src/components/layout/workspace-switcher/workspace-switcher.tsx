"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, LayoutGrid, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { workspaceStore } from "@/stores/workspace.store";
import { cn } from "@/lib/utils/cn";
import { apiClient } from "@/lib/api/client";

type Workspace = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  modules?: string[];
};

type Props = {
  className?: string;
  onAddWorkspace?: () => void;
};

export function WorkspaceSwitcher({ className, onAddWorkspace }: Props) {
  const router = useRouter();
  const { workspaceName, plan, setWorkspace, workspaceSlug } = workspaceStore();
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const activeName = workspaceName ?? workspaceSlug ?? "Workspace";

  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        const { data } = await apiClient.get("/company");
        if (data.success && data.data) {
          const list = data.data.map((c: { id: string; name: string; slug: string; size?: string; modules?: string[] }) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            plan: c.size || "Growth",
            modules: c.modules || [],
          }));
          setWorkspaces(list);
        }
      } catch (err) {
        console.error("Failed to load workspaces:", err);
      }
    }
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 max-w-[200px] items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-2.5 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#191970]/10 text-[#191970]">
          <LayoutGrid className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 truncate text-left text-xs font-semibold text-slate-800 dark:text-slate-200">
          {activeName}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-slate-400 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200/90 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Your workspaces</p>
          {workspaces.map((ws) => {
            const isActive = activeName.toLowerCase() === ws.name.toLowerCase();
            return (
              <button
                key={ws.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  setWorkspace({
                    workspaceId: ws.id,
                    workspaceName: ws.name,
                    workspaceSlug: ws.slug,
                    plan: ws.plan,
                    modules: ws.modules,
                  });
                  setOpen(false);
                  router.push(`/${ws.slug}/dashboard`);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#191970] to-[#2277FF] text-[10px] font-bold text-white">
                  {ws.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{ws.name}</span>
                  <span className="block truncate text-[10px] font-medium uppercase tracking-wide text-slate-500">{ws.plan}</span>
                </span>
                {isActive ? <Check className="h-4 w-4 shrink-0 text-[#2277FF]" /> : null}
              </button>
            );
          })}
          {onAddWorkspace && (
            <div className="border-t border-slate-100 p-2 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onAddWorkspace();
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 py-2 text-xs font-semibold text-[#191970] transition hover:bg-[#191970]/5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add workspace
              </button>
            </div>
          )}
          {plan ? (
            <p className="border-t border-slate-100 px-3 py-2 text-[10px] text-slate-500 dark:border-slate-800">
              Current plan · <span className="font-semibold text-slate-700">{plan}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

