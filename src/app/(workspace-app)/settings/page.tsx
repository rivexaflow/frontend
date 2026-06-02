"use client";

import { Key, Palette, Puzzle, Shield, Users } from "lucide-react";

import { ChangePasswordCard } from "@/components/auth/change-password-card";
import { EnterprisePageShell } from "@/features/workspace/components/enterprise/enterprise-page-shell";

const settingsGroups = [
  {
    title: "Workspace",
    items: [
      { label: "General", description: "Name, timezone, and defaults", icon: Puzzle },
      { label: "Branding", description: "Logo, colors, and email theme", icon: Palette },
      { label: "Modules", description: "Enabled product modules", icon: Puzzle },
    ],
  },
  {
    title: "Security & access",
    items: [
      { label: "Team members", description: "Roles and invitations", icon: Users },
      { label: "API keys", description: "Integrations and webhooks", icon: Key },
      { label: "Password", description: "Credentials and MFA", icon: Shield },
    ],
  },
];

export default function SettingsPage() {
  return (
    <EnterprisePageShell
      eyebrow="System"
      title="Settings"
      description="Workspace configuration, security, branding, and module governance."
      metrics={[
        { label: "Team members", value: "24", icon: Users, tone: "blue" },
        { label: "Active modules", value: "8", icon: Puzzle, tone: "purple" },
        { label: "API keys", value: "3", icon: Key, tone: "amber" },
        { label: "Policy packs", value: "2", icon: Shield, tone: "emerald" },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {settingsGroups.map((group) => (
          <section
            key={group.title}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{group.title}</h2>
            <ul className="mt-4 space-y-2">
              {group.items.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <ChangePasswordCard />
    </EnterprisePageShell>
  );
}
