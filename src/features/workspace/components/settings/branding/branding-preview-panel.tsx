"use client";

import { useState } from "react";
import type { WorkspaceThemeConfig } from "@/features/workspace/schemas/branding.schema";
import { cn } from "@/lib/utils/cn";
import { LayoutDashboard, Target, Eye, Monitor, Globe, Sparkles, Sun, Moon } from "lucide-react";

type Props = {
  brandName: string;
  logo: string;
  theme: WorkspaceThemeConfig;
};

export function BrandingPreviewPanel({ brandName, logo, theme }: Props) {
  const [activeMode, setActiveMode] = useState<"light" | "dark">("light");
  const primary = theme.primaryColor || "#191970";
  const secondary = theme.secondaryColor || "#2277FF";
  const displayName = brandName.trim() || "Your Company";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all dark:border-slate-800/80 dark:bg-slate-900">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Eye className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Real-Time Live Identity Simulator</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Live preview of login portal, workspace chrome, and browser tabs</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveMode("light")}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all",
              activeMode === "light"
                ? "bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400",
            )}
          >
            <Sun className="h-3 w-3 text-amber-500" />
            Light
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("dark")}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all",
              activeMode === "dark"
                ? "bg-slate-800 text-white shadow-sm dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400",
            )}
          >
            <Moon className="h-3 w-3 text-indigo-400" />
            Dark
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className={cn("p-5 space-y-5 transition-colors", activeMode === "dark" && "bg-slate-950 text-white")}>
        <div className="grid gap-5 lg:grid-cols-2">
          {/* 1. Login Portal Simulation */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900">
            <div
              className="flex items-center justify-between px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Login Portal Simulation
              </span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] backdrop-blur">Live</span>
            </div>
            <div
              className="relative flex-1 p-6"
              style={{
                background: theme.loginBackgroundUrl
                  ? `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url(${theme.loginBackgroundUrl}) center/cover`
                  : activeMode === "dark"
                    ? `linear-gradient(135deg, ${primary}30, #090d16)`
                    : `linear-gradient(135deg, ${primary}12, ${secondary}08)`,
              }}
            >
              <div className="mx-auto max-w-[240px] rounded-2xl border border-white/20 bg-white/95 p-5 shadow-2xl backdrop-blur-md transition-all dark:border-slate-800/80 dark:bg-slate-900/95">
                <div className="mb-4 flex items-center justify-center gap-2.5">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="" className="h-8 w-8 object-contain" />
                  ) : (
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold text-white shadow-md"
                      style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                    >
                      {displayName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{displayName}</span>
                </div>

                <div className="text-center">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {theme.loginWelcomeTitle || "Welcome back"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                    {theme.loginWelcomeMessage || "Sign in to your enterprise workspace portal"}
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="h-8 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 text-[10px] text-slate-400 flex items-center dark:border-slate-700 dark:bg-slate-800">
                    user@acme.com
                  </div>
                  <div className="h-8 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 text-[10px] text-slate-400 flex items-center dark:border-slate-700 dark:bg-slate-800">
                    ••••••••••••
                  </div>
                  <div
                    className="flex h-8.5 items-center justify-center rounded-lg text-xs font-bold text-white shadow-md transition-all hover:opacity-95 cursor-pointer"
                    style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                  >
                    Sign in
                  </div>
                </div>

                {!theme.hidePoweredBy ? (
                  <p className="mt-3 text-center text-[9px] font-medium text-slate-400">Powered by Rivexaflow</p>
                ) : null}
              </div>
            </div>
          </div>

          {/* 2. Dashboard Workspace Chrome Preview */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Monitor className="h-3.5 w-3.5 text-blue-600" />
                Workspace Navigation Chrome
              </span>
              <span className="text-[10px] font-mono text-slate-400">1920x1080</span>
            </div>
            <div className="flex h-[230px] flex-1">
              {/* Mini Sidebar */}
              <div className="w-16 shrink-0 border-r border-slate-100 bg-white p-2 flex flex-col items-center justify-between dark:border-slate-800 dark:bg-slate-950">
                <div className="w-full space-y-3">
                  <div
                    className="flex h-9 w-full items-center justify-center rounded-xl text-white shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                  >
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt="" className="h-5 w-5 object-contain" />
                    ) : (
                      <span className="text-xs font-bold">{displayName.slice(0, 1)}</span>
                    )}
                  </div>
                  {[LayoutDashboard, Target].map((Icon, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex h-8 w-full items-center justify-center rounded-xl transition-all",
                        i === 0 ? "text-white shadow-sm" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900",
                      )}
                      style={i === 0 ? { background: primary } : undefined}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  ))}
                </div>
                <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Mini Main Content */}
              <div className="min-w-0 flex-1 bg-slate-50/70 p-4 dark:bg-slate-900/40">
                <div className="mb-3 flex items-center justify-between border-b border-slate-200/60 pb-2.5 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-1 rounded-full" style={{ background: `linear-gradient(to bottom, ${primary}, ${secondary})` }} />
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600">Active View</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{theme.browserTitle || `${displayName} · Workspace`}</p>
                    </div>
                  </div>
                  <div
                    className="rounded-lg px-2.5 py-1 text-[10px] font-bold text-white shadow-sm"
                    style={{ background: primary }}
                  >
                    + Add Record
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="h-16 rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="h-2 w-12 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="mt-2 h-4 w-8 rounded font-bold" style={{ color: primary }}>$42k</div>
                  </div>
                  <div className="h-16 rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="h-2 w-12 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="mt-2 h-4 w-8 rounded font-bold text-emerald-600">+128</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Browser Tab Window Preview */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Globe className="h-3.5 w-3.5 text-indigo-500" />
              Browser Window Tab Rendering
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-950">
            {theme.favicon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={theme.favicon} alt="" className="h-4 w-4 object-contain" />
            ) : (
              <div className="flex h-4 w-4 items-center justify-center rounded bg-blue-100 text-[9px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {displayName.slice(0, 1)}
              </div>
            )}
            <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
              {theme.browserTitle || theme.metaTitle || `${displayName} · Enterprise Workspace`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
