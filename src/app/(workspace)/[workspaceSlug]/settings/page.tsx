import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Settings hub"
      description="Workspace configuration entry points."
      bullets={["Workspace profile","Branding","Billing","Modules","API keys"]}
    />
  );
}
