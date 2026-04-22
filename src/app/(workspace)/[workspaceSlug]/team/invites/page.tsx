import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Invites"
      description="Email invitations with role templates and expiry tracking."
      bullets={["Open invites: 5","Expired: 1","Accepted this week: 12"]}
    />
  );
}
