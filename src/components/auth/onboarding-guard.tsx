"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { ONBOARDING_PATH } from "@/lib/auth/onboarding-redirect";
import { hasCompletedOnboarding } from "@/lib/auth/post-auth-destination";
import { authStore } from "@/stores/auth.store";

/**
 * Redirects authenticated users with incomplete onboarding to /onboarding.
 * Mount in workspace layout only — super-admin and public routes are excluded.
 */
export function OnboardingGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = authStore((s) => s.user);
  const token = authStore((s) => s.token);

  useEffect(() => {
    if (!token || !user) return;
    if (hasCompletedOnboarding(user)) return;
    const step = user.onboardingStep;
    if (step && step !== "DONE" && step !== "DASHBOARD_LOAD") {
      router.replace(ONBOARDING_PATH);
    }
  }, [router, token, user]);

  return <>{children}</>;
}
