import { redirect } from "next/navigation";

import { workspacePaths } from "@/lib/workspace/paths";

export default function HrmLoansPage() {
  redirect(workspacePaths.hrmDashboard);
}
