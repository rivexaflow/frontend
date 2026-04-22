import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Templates"
      description="Reusable checklist templates per jurisdiction."
      bullets={["EU pack v3","US SMB pack","APAC enterprise"]}
    />
  );
}
