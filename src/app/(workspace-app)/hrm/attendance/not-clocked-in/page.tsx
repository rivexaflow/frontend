import { redirect } from "next/navigation";

import { workspacePaths } from "@/lib/workspace/paths";

export default function HrmAttendanceNotClockedInPage() {
  redirect(`${workspacePaths.hrmAttendance}?tab=not-clocked-in`);
}
