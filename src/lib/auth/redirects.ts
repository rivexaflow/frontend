import type { Role } from "@/types/auth";
import { workspacePaths } from "@/lib/workspace/paths";

export const postLoginPath = (role: Role, _workspaceSlug?: string) => {
  if (role === "SUPER_ADMIN") return "/super-admin";
  return workspacePaths.dashboard;
};
