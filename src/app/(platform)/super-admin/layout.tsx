import { ReactNode } from "react";
import { SuperAdminAppShell } from "@/features/super-admin/components/super-admin-app-shell";

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return <SuperAdminAppShell>{children}</SuperAdminAppShell>;
}
