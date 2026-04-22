import { SuperAdminModulePanel } from "@/features/super-admin/components/super-admin-module-panel";

export default function Page() {
  return (
    <SuperAdminModulePanel
      title="Tenant directory"
      description="Searchable list of customer workspaces with health signals."
      bullets={["Growth tenants: 18","Suspended: 3","Trials expiring: 4"]}
    />
  );
}
