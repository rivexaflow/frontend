"use client";

import React from "react";
import { Plus, Search, Filter, Download } from "lucide-react";
import { TenantStats } from "@/features/super-admin/components/tenants/tenant-stats";
import { TenantTable } from "@/features/super-admin/components/tenants/tenant-table";

export default function TenantsPage() {
  return (
    <div className="min-h-screen p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Tenant <span className="text-blue-600">Directory</span>
          </h1>
          <p className="mt-1 text-slate-500">
            Manage customer workspaces, monitor health signals, and adjust subscription tiers.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="h-5 w-5" />
          Create New Tenant
        </button>
      </div>

      {/* Stats Summary */}
      <TenantStats />

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by organization name, slug or ID..." 
            className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Data Table */}
      <TenantTable />
    </div>
  );
}
