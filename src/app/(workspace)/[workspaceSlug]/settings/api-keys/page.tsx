import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="API keys"
      description="Rotatable keys with scoped permissions and usage charts."
      bullets={["Live key: rvx_live_***","Last rotated: 12d ago","Requests/day: 42k"]}
    />
  );
}
