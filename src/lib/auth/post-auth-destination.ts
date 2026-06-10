import { postLoginPath } from "@/lib/auth/redirects";
import type { AuthResult } from "@/lib/api/auth";
import type { OnboardingState, OnboardingStep, ProfileRole } from "@/types/onboarding";
import { isOnboardingComplete } from "@/types/onboarding";
import { effectiveNavRole, type CurrentUser } from "@/types/auth";
import { applyCompanyToUser, slugFromCompany } from "@/lib/workspace/company-context";
import { canonicalWorkspacePath } from "@/lib/workspace/paths";

const PROFILE_ROLES = new Set<ProfileRole>(["owner", "manager", "freelancer"]);

export const ONBOARDING_COMPLETE_KEY = "rvx-onboarding-complete";

/** User finished setup (modules chosen, etc.) — do not send them back to /onboarding. */
export function hasCompletedOnboarding(
  user: Pick<CurrentUser, "onboardingStep" | "selectedModules" | "profileRole"> | null | undefined,
): boolean {
  if (!user) return false;
  if (isOnboardingComplete(user.onboardingStep)) return true;
  const modules = user.selectedModules ?? [];
  if (modules.length > 0 && user.profileRole && PROFILE_ROLES.has(user.profileRole as ProfileRole)) {
    return true;
  }
  if (typeof window !== "undefined" && sessionStorage.getItem(ONBOARDING_COMPLETE_KEY) === "1") {
    return true;
  }
  return false;
}

/**
 * After sign-in on /login: always workspace dashboard (never /onboarding).
 * Onboarding is only entered right after registration.
 */
export function resolveLoginDestination(
  user: CurrentUser,
  options?: { redirectTo?: string },
): string {
  const redirectTo = options?.redirectTo;
  if (redirectTo && !redirectTo.startsWith("/onboarding")) {
    return canonicalWorkspacePath(redirectTo) ?? redirectTo;
  }

  const navRole = effectiveNavRole(user) ?? user.role;
  return postLoginPath(navRole);
}

export function markOnboardingCompleteInBrowser(): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(ONBOARDING_COMPLETE_KEY, "1");
  }
}

export function mergeAuthWithOnboarding(
  auth: AuthResult,
  onboarding: OnboardingState | null,
): { user: CurrentUser; onboardingStep?: string } {
  const base: CurrentUser = {
    id: auth.user.id,
    name: auth.user.name,
    fullName: auth.user.name,
    email: auth.user.email,
    role: auth.user.role,
    workspaceId: auth.user.workspaceId,
    workspaceSlug: auth.user.workspaceSlug,
    profileRole: auth.user.profileRole,
    onboardingStep: auth.onboardingStep ?? auth.user.onboardingStep,
    selectedModules: auth.user.selectedModules,
  };

  if (!onboarding) {
    const user =
      hasCompletedOnboarding(base) && !isOnboardingComplete(base.onboardingStep)
        ? { ...base, onboardingStep: "DONE" as const }
        : base;
    return { user, onboardingStep: user.onboardingStep };
  }

  const modules =
    onboarding.company?.modules?.length
      ? onboarding.company.modules
      : base.selectedModules;

  const profileRole =
    base.profileRole ??
    (PROFILE_ROLES.has(onboarding.user.role as ProfileRole)
      ? (onboarding.user.role as ProfileRole)
      : undefined);

  const authStep = base.onboardingStep;
  const remoteStep = onboarding.step ?? onboarding.user.onboardingStep;
  let onboardingStep: OnboardingStep | string = remoteStep;
  if (authStep != null && isOnboardingComplete(authStep)) onboardingStep = authStep;
  else if (modules && modules.length > 0 && profileRole) onboardingStep = "DONE";

  const user = applyCompanyToUser(
    {
      ...base,
      name: onboarding.user.fullName || base.name,
      fullName: onboarding.user.fullName || base.fullName,
      profileRole,
      onboardingStep,
      selectedModules: modules,
      workspaceSlug: slugFromCompany(onboarding.company) ?? base.workspaceSlug,
    },
    onboarding.company,
  );

  return { user, onboardingStep };
}
