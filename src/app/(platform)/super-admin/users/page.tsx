import { SuperAdminModulePanel } from "@/features/super-admin/components/super-admin-module-panel";

export default function Page() {
  return (
    <SuperAdminModulePanel
      title="Platform users"
      description="Super admin roster with MFA enforcement tracking."
      bullets={["Admins: 6","MFA: enforced","Last login audits"]}
    />
  );
}
