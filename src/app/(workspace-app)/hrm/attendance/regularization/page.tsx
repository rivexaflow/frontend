import { redirect } from "next/navigation";

import { workspacePaths } from "@/lib/workspace/paths";

export default function HrmAttendanceRegularizationPage() {
  redirect(`${workspacePaths.hrmAttendance}?tab=regularization`);
}
