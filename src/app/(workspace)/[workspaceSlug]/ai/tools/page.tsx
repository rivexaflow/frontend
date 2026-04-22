import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="AI tools"
      description="Catalog of enabled tools with owners and scopes."
      bullets={["Doc extractor","WhatsApp agent","Invoice draft assistant"]}
    />
  );
}
