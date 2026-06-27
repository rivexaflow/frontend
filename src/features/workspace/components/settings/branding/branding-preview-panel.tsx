"use client";

import type { WorkspaceThemeConfig } from "@/features/workspace/schemas/branding.schema";
import { cn } from "@/lib/utils/cn";
import { LayoutDashboard, Target } from "lucide-react";

type Props = {
  brandName: string;
  logo: string;
  theme: WorkspaceThemeConfig;
};

export function BrandingPreviewPanel({ brandName, logo, theme }: Props) {
  const primary = theme.primaryColor || "#191970";
  const secondary = theme.secondaryColor || "#2277FF";
  const displayName = brandName.trim() || "Your Company";

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Live preview</p>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Login preview */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800">
          <div
            className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white/80"
            style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
          >
            Login page
          </div>
          <div
            className="p-5"
            style={{
              background: theme.loginBackgroundUrl
                ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${theme.loginBackgroundUrl}) center/cover`
                : `linear-gradient(135deg, ${primary}15, ${secondary}10)`,
            }}
          >
            <div className="mx-auto max-w-[220px] rounded-xl border border-white/20 bg-white/95 p-4 shadow-lg backdrop-blur dark:bg-slate-900/95">
              <div className="mb-3 flex items-center gap-2">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt="" className="h-7 w-7 object-contain" />
                ) : (
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                    style={{ background: primary }}
                  >
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800 dark:text-white">{displayName}</span>
              </div>
              <p className="text-[11px] font-bold text-slate-800 dark:text-white">
                {theme.loginWelcomeTitle || "Welcome back"}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                {theme.loginWelcomeMessage || "Sign in to your workspace portal"}
              </p>
              <div className="mt-3 space-y-2">
                <div className="h-7 rounded-md border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800" />
                <div className="h-7 rounded-md border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800" />
                <div
                  className="flex h-8 items-center justify-center rounded-md text-[10px] font-bold text-white"
                  style={{ background: primary }}
                >
                  Sign in
                </div>
              </div>
              {!theme.hidePoweredBy ? (
                <p className="mt-2 text-center text-[9px] text-slate-400">Powered by Rivexaflow</p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Dashboard chrome preview */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800">
          <div className="border-b border-slate-100 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dashboard chrome</p>
          </div>
          <div className="flex h-[200px]">
            <div className="w-14 shrink-0 border-r border-slate-100 bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
              <div
                className="mb-3 flex h-8 w-full items-center justify-center rounded-lg text-white"
                style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
              >
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt="" className="h-4 w-4 object-contain" />
                ) : (
                  <span className="text-[9px] font-bold">{displayName.slice(0, 1)}</span>
                )}
              </div>
              {[LayoutDashboard, Target].map((Icon, i) => (
                <div
                  key={i}
                  className={cn(
                    "mb-1 flex h-7 w-full items-center justify-center rounded-lg",
                    i === 0 ? "text-white" : "text-slate-400",
                  )}
                  style={i === 0 ? { background: primary } : undefined}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
              ))}
            </div>
            <div className="min-w-0 flex-1 bg-slate-50 p-3 dark:bg-slate-900/50">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-4 w-1 rounded-full" style={{ background: `linear-gradient(to bottom, ${primary}, ${secondary})` }} />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#2277FF]">Panel</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{theme.browserTitle || "CRM · Leads"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-12 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
                <div className="h-12 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
              </div>
              <div
                className="mt-2 inline-flex rounded-md px-2 py-1 text-[10px] font-bold text-white"
                style={{ background: primary }}
              >
                Primary action
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Browser tab preview */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Browser tab</p>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
          {theme.favicon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={theme.favicon} alt="" className="h-4 w-4 object-contain" />
          ) : (
            <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700" />
          )}
          <span className="truncate text-xs text-slate-600 dark:text-slate-300">
            {theme.browserTitle || theme.metaTitle || `${displayName} · Workspace`}
          </span>
        </div>
      </div>
    </div>
  );
}
