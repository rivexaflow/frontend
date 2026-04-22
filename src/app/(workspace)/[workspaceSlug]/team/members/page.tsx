import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Members"
      description="Searchable roster with role assignments and last active time."
      bullets={["Top seat: Operations","MFA enforced: 94%","SSO connected"]}
    />
  );
}
