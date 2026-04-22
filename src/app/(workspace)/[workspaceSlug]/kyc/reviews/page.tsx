import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Reviews"
      description="Reviewer assignments and SLA timers."
      bullets={["Avg review time: 14m","Overdue: 2","QA sample rate: 10%"]}
    />
  );
}
