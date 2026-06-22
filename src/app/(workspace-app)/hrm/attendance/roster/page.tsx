import { redirect } from "next/navigation";

import { workspacePaths } from "@/lib/workspace/paths";

export default function HrmAttendanceRosterPage() {
  redirect(`${workspacePaths.hrmAttendance}?tab=roster`);
}
