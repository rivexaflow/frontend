import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Submissions"
      description="Inbound documents with extraction confidence scores."
      bullets={["Passport uploads: 18","Business docs: 9","Low confidence: 3"]}
    />
  );
}
