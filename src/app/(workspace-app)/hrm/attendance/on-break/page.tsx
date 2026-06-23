import { redirect } from "next/navigation";

import { workspacePaths } from "@/lib/workspace/paths";

export default function HrmAttendanceOnBreakPage() {
  redirect(`${workspacePaths.hrmAttendance}?tab=on-break`);
}
