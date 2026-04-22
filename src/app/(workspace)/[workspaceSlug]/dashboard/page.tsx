import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Workspace dashboard"
      description="KPIs, live activity, and operational health for this organization."
      bullets={["Live agent feed","KYC throughput","Invoice aging","AI automation runs"]}
    />
  );
}
