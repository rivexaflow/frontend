import { hasCompletedOnboarding } from "@/lib/auth/post-auth-destination";
import { postLoginPath } from "@/lib/auth/redirects";
import type { OnboardingState, OnboardingStep } from "@/types/onboarding";
import { isOnboardingComplete } from "@/types/onboarding";
import type { CurrentUser, Role } from "@/types/auth";
import { appConfig } from "@/config/app";

export const ONBOARDING_PATH = "/onboarding";
export const LOGIN_AFTER_ONBOARDING = "/login?onboarding=complete";

export function resolveAuthDestination(
  user: Pick<CurrentUser, "role" | "workspaceSlug">,
  options?: {
    onboardingStep?: OnboardingStep | string;
    redirectTo?: string;
  },
): string {
  const step = options?.onboardingStep;
  if (step && !isOnboardingComplete(step) && !hasCompletedOnboarding({ onboardingStep: step })) {
    return ONBOARDING_PATH;
  }
  if (options?.redirectTo) return options.redirectTo;

  const slug = user.workspaceSlug ?? appConfig.defaultWorkspaceSlug;
  return postLoginPath(user.role, slug);
}

export function mergeOnboardingIntoUser(
  user: CurrentUser,
  state: OnboardingState,
): CurrentUser {
  const slug =
    (state.company as { slug?: string } | undefined)?.slug ??
    user.workspaceSlug;

  return {
    ...user,
    name: state.user.fullName || user.name,
    fullName: state.user.fullName || user.fullName,
    profileRole:
      (state.user.role as CurrentUser["profileRole"]) ?? user.profileRole,
    onboardingStep: state.user.onboardingStep ?? state.step,
    selectedModules: state.company?.modules ?? user.selectedModules,
    workspaceSlug: slug ?? user.workspaceSlug,
  };
}

export function destinationFromOnboardingState(
  state: OnboardingState,
  fallbackUser: CurrentUser,
): string {
  if (!isOnboardingComplete(state.step) && !isOnboardingComplete(state.nextStep)) {
    return ONBOARDING_PATH;
  }

  const merged = mergeOnboardingIntoUser(fallbackUser, state);
  const slug = merged.workspaceSlug ?? appConfig.defaultWorkspaceSlug;
  return postLoginPath(merged.role, slug);
}
