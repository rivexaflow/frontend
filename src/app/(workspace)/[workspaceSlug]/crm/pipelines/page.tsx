import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Pipelines"
      description="Stage definitions, conversion metrics, and forecast rollups."
      bullets={["Enterprise pipeline: $1.2M","SMB pipeline: $420k","Velocity +12% MoM"]}
    />
  );
}
