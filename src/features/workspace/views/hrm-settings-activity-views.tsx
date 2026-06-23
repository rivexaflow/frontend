"use client";

import Link from "next/link";
import { Activity, Settings, Shield, Sliders } from "lucide-react";

import { HrmPageHeader, HrmPanel } from "@/features/workspace/components/hrm/hrm-page-header";
import { HrmModuleTableView, StatusPill } from "@/features/workspace/components/hrm/hrm-module-table";
import { DEMO_HRM_ACTIVITY } from "@/features/workspace/data/hrm-modules-demo";
import { workspacePaths } from "@/lib/workspace/paths";

export function HrmActivityView() {
  return (
    <HrmModuleTableView
      module="People · HRM · Activity"
      title="Activity timeline"
      description="Audit trail of HR actions — profile changes, approvals, and system events."
      rows={DEMO_HRM_ACTIVITY}
      columns={[
        { key: "action", label: "Action" },
        { key: "module", label: "Module" },
        { key: "detail", label: "Detail" },
        { key: "actor", label: "Actor" },
        { key: "occurredAt", label: "When" },
      ]}
    />
  );
}

export function HrmSettingsView() {
  const links = [
    { icon: Shield, label: "Roles & permissions", description: "RBAC, data scope, and HR role templates.", href: workspacePaths.hrmAdmin },
    { icon: Sliders, label: "System setup", description: "Leave types, shifts, payroll defaults, and policies.", href: workspacePaths.hrmSetup },
    { icon: Settings, label: "Workspace settings", description: "Notifications, security, and preferences.", href: workspacePaths.settings },
  ];

  return (
    <div className="pb-10">
      <HrmPageHeader
        module="People · HRM · Settings"
        title="HR settings"
        description="Configure roles, permissions, portals, and HR system defaults."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-[#191970]/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <item.icon className="h-8 w-8 text-[#191970] transition group-hover:scale-105" />
            <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{item.label}</h3>
            <p className="mt-1 text-sm text-slate-500">{item.description}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6">
        <HrmPanel title="Permissions overview" description="Demo — full RBAC matrix ships with backend policy API.">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Activity className="h-4 w-4 text-slate-400" />
            <span>Manage granular module permissions from</span>
            <Link href={workspacePaths.hrmAdmin} className="font-semibold text-[#191970] hover:underline">
              Roles & permissions
            </Link>
          </div>
        </HrmPanel>
      </div>
    </div>
  );
}
