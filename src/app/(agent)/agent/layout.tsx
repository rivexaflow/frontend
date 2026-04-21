"use client";

import { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";

export default function AgentLayout({ children }: { children: ReactNode }) {
  return <AppShell role="USER">{children}</AppShell>;
}
