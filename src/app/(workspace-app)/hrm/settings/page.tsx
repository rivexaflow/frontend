import { redirect } from "next/navigation";

import { workspacePaths } from "@/lib/workspace/paths";

/** Legacy HR settings hub removed — redirect to roles & permissions. */
export default function HrmSettingsPage() {
  redirect(workspacePaths.hrmAdmin);
}
