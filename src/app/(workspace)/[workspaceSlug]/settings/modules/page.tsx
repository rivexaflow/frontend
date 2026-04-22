import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Modules"
      description="Feature flags and dependency mapping between modules."
      bullets={["CRM: on","KYC: on","AI: partial rollout"]}
    />
  );
}
