import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Activity"
      description="Audit-style stream of administrative actions."
      bullets={["Role change: Priya -> CRM Lead","Module enabled: WhatsApp","Billing email updated"]}
    />
  );
}
