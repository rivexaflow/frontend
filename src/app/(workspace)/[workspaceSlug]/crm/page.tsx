import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="CRM overview"
      description="Pipeline health and revenue coverage for the workspace."
      bullets={["Open deals: 48","Win rate: 34%","Avg cycle: 18 days"]}
    />
  );
}
