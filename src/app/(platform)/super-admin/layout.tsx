import { ReactNode } from "react";
import { SessionHydrator } from "@/components/auth/session-hydrator";

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SessionHydrator />
      {children}
    </>
  );
}
