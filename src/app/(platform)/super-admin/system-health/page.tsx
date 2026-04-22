import { SuperAdminModulePanel } from "@/features/super-admin/components/super-admin-module-panel";

export default function Page() {
  return (
    <SuperAdminModulePanel
      title="System health"
      description="Synthetic checks plus dependency dashboards."
      bullets={["API p99: 182ms","DB replicas: healthy","Queue depth: low"]}
    />
  );
}
