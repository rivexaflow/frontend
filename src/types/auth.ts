import type { OnboardingStep, ProfileRole } from "@/types/onboarding";

export type Role = "SUPER_ADMIN" | "ADMIN" | "USER";

export type CurrentUser = {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  role: Role;
  workspaceId?: string;
  workspaceSlug?: string;
  /** Job title from onboarding (owner, manager, …). Drives dashboard & nav when set. */
  profileRole?: ProfileRole | string;
  onboardingStep?: OnboardingStep | string;
  selectedModules?: string[];
};

/** Sidebar / dashboard experience: profile role overrides USER when owner/manager. */
export function effectiveNavRole(user: CurrentUser | null): Role | null {
  if (!user) return null;
  if (user.role === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (user.profileRole === "owner" || user.profileRole === "manager") return "ADMIN";
  if (user.profileRole === "freelancer") return "USER";
  return user.role;
}
