import { SuperAdminModulePanel } from "@/features/super-admin/components/super-admin-module-panel";

export default function Page() {
  return (
    <SuperAdminModulePanel
      title="Tenant detail"
      description="Deep dive on usage, billing, and risk for a single tenant."
      bullets={["Seat usage: 86/100","Last incident: none","Plan: Enterprise"]}
    />
  );
}
