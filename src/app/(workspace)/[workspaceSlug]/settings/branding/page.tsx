import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Branding"
      description="Logos, accent colors, and customer-facing email templates."
      bullets={["Primary #2277FF","Email footer synced","Preview: enabled"]}
    />
  );
}
