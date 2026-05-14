import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";
import { ChangePasswordCard } from "@/components/auth/change-password-card";

export default function Page() {
  return (
    <div className="space-y-6">
      <WorkspaceModulePanel
        title="Settings hub"
        description="Workspace configuration entry points."
        bullets={["Workspace profile", "Branding", "Billing", "Modules", "API keys"]}
      />
      <ChangePasswordCard />
    </div>
  );
}
