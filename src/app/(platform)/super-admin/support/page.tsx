import { SuperAdminModulePanel } from "@/features/super-admin/components/super-admin-module-panel";

export default function SupportPage() {
  return (
    <SuperAdminModulePanel
      title="Support Tickets"
      description="Platform-wide helpdesk and ticket moderation."
      bullets={[
        "Open Tickets: 24",
        "Assigned: 18",
        "SLA compliance: 96%",
        "Average response: 28m"
      ]}
    />
  );
}
