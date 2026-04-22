import { SuperAdminModulePanel } from "@/features/super-admin/components/super-admin-module-panel";

export default function Page() {
  return (
    <SuperAdminModulePanel
      title="Audit logs"
      description="Immutable record of platform-level administrative actions."
      bullets={["Exports enabled","Retention: 400d","Tamper-evident storage"]}
    />
  );
}
