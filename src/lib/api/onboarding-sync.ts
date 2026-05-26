"use client";

import { onboardingApi } from "@/lib/api/onboarding";
import { mergeOnboardingIntoUser } from "@/lib/auth/onboarding-redirect";
import { authStore } from "@/stores/auth.store";
import type { OnboardingState } from "@/types/onboarding";

/**
 * Links the Auth lane (/api/auth/*) with the Onboarding lane (/api/onboarding/*).
 *
 * Register/login via auth creates the user + JWT but may not initialize the
 * onboarding state machine. POST /api/onboarding/login attaches the same user
 * to the onboarding pipeline (step, nextStep, etc.).
 */
export async function syncOnboardingLane(credentials: {
  email: string;
  password: string;
}): Promise<OnboardingState | null> {
  try {
    return await onboardingApi.login(credentials);
  } catch {
    return null;
  }
}

export function applyOnboardingStateToAuthUser(state: OnboardingState): void {
  const current = authStore.getState().user;
  if (!current) return;
  authStore.getState().updateUser(mergeOnboardingIntoUser(current, state));
}
