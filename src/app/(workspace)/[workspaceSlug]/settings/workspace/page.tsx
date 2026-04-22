import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Workspace profile"
      description="Legal entity data, timezone, and data residency preferences."
      bullets={["Entity: Rivexa Demo LLC","Region: EU-West","Retention: 24 months"]}
    />
  );
}
