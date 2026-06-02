import { redirect } from "next/navigation";

import { workspacePaths } from "@/lib/workspace/paths";

export default function LegacyTeamRolesPage() {
  redirect(workspacePaths.role);
}
