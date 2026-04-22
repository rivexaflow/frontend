import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="AI overview"
      description="Adoption, spend guardrails, and reliability of AI modules."
      bullets={["Runs today: 277","Error rate: 0.4%","Top module: WhatsApp"]}
    />
  );
}
