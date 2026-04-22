import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Notifications"
      description="In-app alerts with read state and routing deep links."
      bullets={["Unread: 6","Mentions: 2","System: 1"]}
    />
  );
}
