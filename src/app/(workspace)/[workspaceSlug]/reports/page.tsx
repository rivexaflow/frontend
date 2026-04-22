import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Reports"
      description="Executive summaries and scheduled report delivery."
      bullets={["Weekly ops digest","Finance pack","Compliance export"]}
    />
  );
}
