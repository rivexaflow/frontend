import { SuperAdminModulePanel } from "@/features/super-admin/components/super-admin-module-panel";

export default function KycPage() {
  return (
    <SuperAdminModulePanel
      title="KYC Submissions"
      description="Identity verification queue for all platform users."
      bullets={[
        "Pending: 12",
        "Approved: 145",
        "Rejected: 8",
        "Average review time: 4.2h"
      ]}
    />
  );
}
