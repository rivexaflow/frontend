import { WorkspaceModulePanel } from "@/features/workspace/components/workspace-module-panel";

export default function Page() {
  return (
    <WorkspaceModulePanel
      title="Invoices"
      description="Receivables overview with status rollups."
      bullets={["Open AR: $182k","Overdue: $24k","Paid this week: $96k"]}
    />
  );
}
