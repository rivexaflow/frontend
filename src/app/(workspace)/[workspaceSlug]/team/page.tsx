import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Team overview"
      description="Headcount, roles, and module access distribution."
      bullets={["Active members: 86","Pending invites: 5","Admins: 3"]}
    />
  );
}
