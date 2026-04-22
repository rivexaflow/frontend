import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Invoice detail"
      description="Line items, approvals, payment timeline, and PDF history."
      bullets={["Invoice resolved from URL","Status: Awaiting payment","Due in 6 days"]}
    />
  );
}
