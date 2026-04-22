import type { Role } from "@/types/auth";

export const canAccessWorkspace = (role: Role | null) => role === "ADMIN" || role === "USER";

export const canAccessPlatform = (role: Role | null) => role === "SUPER_ADMIN";
