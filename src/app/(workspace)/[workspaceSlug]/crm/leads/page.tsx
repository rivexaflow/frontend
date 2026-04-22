import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Leads"
      description="Inbound and outbound lead intake with SLA tracking."
      bullets={["New leads today: 54","SLA breaches: 2","Auto-routed: 38"]}
    />
  );
}
