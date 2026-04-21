"use client";

import { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return <AppShell role="SUPER_ADMIN">{children}</AppShell>;
}
