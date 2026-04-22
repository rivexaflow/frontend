import type { Role } from "@/types/auth";

export const postLoginPath = (role: Role, workspaceSlug: string) => {
  if (role === "SUPER_ADMIN") return "/super-admin";
  return `/${workspaceSlug}/dashboard`;
};
