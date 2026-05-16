export type Role = "SUPER_ADMIN" | "ADMIN" | "USER";

export type CurrentUser = {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  role: Role;
  workspaceId?: string;
  workspaceSlug?: string;
};
