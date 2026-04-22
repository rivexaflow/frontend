import { SuperAdminModulePanel } from "@/features/super-admin/components/super-admin-module-panel";

export default function Page() {
  return (
    <SuperAdminModulePanel
      title="Platform billing"
      description="Plan catalog, revenue recognition, and dunning posture."
      bullets={["MRR: $482k","Churn: 1.1%","Trials converting: 38%"]}
    />
  );
}
