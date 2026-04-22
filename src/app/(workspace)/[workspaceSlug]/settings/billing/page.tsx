import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Billing"
      description="Plans, invoices, and payment methods on file."
      bullets={["Plan: Growth","Next charge: Apr 28","Seats billed: 86"]}
    />
  );
}
