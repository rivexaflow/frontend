"use client";

import { ReactNode, useState } from "react";

import { SuperAdminHeader } from "@/features/super-admin/components/super-admin-header";
import { SuperAdminMobileNav } from "@/features/super-admin/components/super-admin-mobile-nav";
import { SuperAdminSidebar } from "@/components/layout/sidebar/super-admin-sidebar";

export function SuperAdminAppShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#eef2fb]">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, rgba(34,119,255,0.08), transparent 42%), radial-gradient(circle at 90% 80%, rgba(99,102,241,0.06), transparent 40%)",
        }}
        aria-hidden
      />
      <SuperAdminSidebar />
      <SuperAdminMobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <SuperAdminHeader title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {description ? (
            <p className="mb-6 max-w-3xl text-sm leading-relaxed text-slate-600">{description}</p>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
