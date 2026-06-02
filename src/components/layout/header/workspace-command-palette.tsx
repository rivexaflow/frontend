"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  FileText,
  Layers,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";

import { workspacePaths } from "@/lib/workspace/paths";

type CommandItem = {
  id: string;
  label: string;
  hint: string;
  href: string;
  icon: React.ElementType;
  keywords: string[];
};

const COMMANDS: CommandItem[] = [
  { id: "dash", label: "Dashboard", hint: "Overview & quick actions", href: workspacePaths.dashboard, icon: LayoutDashboard, keywords: ["home", "overview"] },
  { id: "contacts", label: "Contacts", hint: "CRM · People & accounts", href: workspacePaths.contacts, icon: Users, keywords: ["crm", "people"] },
  { id: "leads", label: "Leads", hint: "CRM · Pipeline intake", href: workspacePaths.leads, icon: Target, keywords: ["crm", "prospects"] },
  { id: "pipelines", label: "Pipelines", hint: "CRM · Deals & stages", href: workspacePaths.pipelines, icon: Layers, keywords: ["deals", "opportunities"] },
  { id: "kyc", label: "KYC Center", hint: "Identity verification", href: workspacePaths.kyc, icon: ShieldCheck, keywords: ["compliance", "verification"] },
  { id: "invoices", label: "Invoices", hint: "Billing & receivables", href: workspacePaths.invoices, icon: FileText, keywords: ["billing", "finance"] },
  { id: "ai", label: "AI Agents", hint: "Automations & assistants", href: workspacePaths.ai, icon: Sparkles, keywords: ["automation", "intelligence"] },
  { id: "reports", label: "Analytics", hint: "Reports & insights", href: workspacePaths.reports, icon: Zap, keywords: ["reports", "metrics"] },
  { id: "notifications", label: "Notifications", hint: "Alerts & activity", href: workspacePaths.notifications, icon: Bell, keywords: ["alerts"] },
  { id: "settings", label: "Settings", hint: "Workspace configuration", href: workspacePaths.settings, icon: Settings, keywords: ["preferences", "security"] },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function WorkspaceCommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.hint.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.includes(q)),
    );
  }, [query]);

  const go = useCallback(
    (href: string) => {
      onClose();
      setQuery("");
      router.push(href);
    },
    [onClose, router],
  );

  useEffect(() => {
    if (!open) setQuery("");
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

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/40 p-4 pt-[12vh] backdrop-blur-sm">
      <button type="button" className="absolute inset-0" aria-label="Close search" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search workspace"
        className="relative z-[1] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 dark:border-slate-800">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modules, pages, actions…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <kbd className="hidden rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 sm:inline">
            esc
          </kbd>
        </div>
        <ul className="max-h-[min(360px,50vh)] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-slate-500">No results for “{query}”</li>
          ) : (
            filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item.href)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">{item.label}</span>
                    <span className="block truncate text-xs text-slate-500">{item.hint}</span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400 dark:border-slate-800">
          <span className="font-medium text-slate-500">Tip:</span> Press{" "}
          <kbd className="rounded border border-slate-200 px-1 font-mono text-[10px]">⌘K</kbd> anywhere in the workspace
        </div>
      </div>
    </div>
  );
}

export function useWorkspaceCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { open, setOpen, close: () => setOpen(false) };
}
