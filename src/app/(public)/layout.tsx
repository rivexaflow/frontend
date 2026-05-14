import { ReactNode } from "react";

/**
 * Marketing surface — uses display fonts (Gebuk for body, Reckoner for `.font-heading`).
 * Everything outside this layout (workspace, admin, auth, etc.) keeps the clean Inter base.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--rvx-white)] font-subheading antialiased">
      {children}
    </div>
  );
}
