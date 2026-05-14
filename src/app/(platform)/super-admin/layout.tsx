import { ReactNode } from "react";
import { SuperAdminAppShell } from "@/features/super-admin/components/super-admin-app-shell";
import { SessionHydrator } from "@/components/auth/session-hydrator";

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SessionHydrator />
      <SuperAdminAppShell>{children}</SuperAdminAppShell>
    </>
  );
}
