import { redirect } from "next/navigation";

import { workspacePaths } from "@/lib/workspace/paths";

/** Events module removed — redirect legacy bookmarks to HRM dashboard. */
export default function HrmEventsPage() {
  redirect(workspacePaths.hrmDashboard);
}
