import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Create invoice"
      description="Guided invoice builder with tax profiles."
      bullets={["Draft autosave on","Approvals: 2-step","Default currency: USD"]}
    />
  );
}
