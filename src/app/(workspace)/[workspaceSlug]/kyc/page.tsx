import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="KYC overview"
      description="Queue health, risk posture, and automation coverage."
      bullets={["Pending reviews: 27","Auto-approved: 64%","Escalations: 4"]}
    />
  );
}
