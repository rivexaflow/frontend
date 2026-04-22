import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Contacts"
      description="Directory of companies and stakeholders with engagement scoring."
      bullets={["2.4k contacts synced","312 touched this week","Duplicates resolved: 41"]}
    />
  );
}
