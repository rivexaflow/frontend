import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="AI history"
      description="Immutable execution log for compliance reviews."
      bullets={["Last 100 runs retained","PII redaction on","Export enabled"]}
    />
  );
}
