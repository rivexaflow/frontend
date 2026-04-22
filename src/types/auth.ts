export type Role = "SUPER_ADMIN" | "ADMIN" | "USER";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  workspaceId?: string;
  workspaceSlug?: string;
};
