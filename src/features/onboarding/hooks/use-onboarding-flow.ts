"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";

import { onboardingApi } from "@/lib/api/onboarding";
import {
  LOGIN_AFTER_ONBOARDING,
  mergeOnboardingIntoUser,
} from "@/lib/auth/onboarding-redirect";
import { markOnboardingCompleteInBrowser } from "@/lib/auth/post-auth-destination";
import { authStore } from "@/stores/auth.store";
import type { BasicInfoForm, BusinessInfoForm } from "@/features/onboarding/schemas/onboarding.schema";
import type { OnboardingState } from "@/types/onboarding";
import { isOnboardingComplete, uiStepFromApi } from "@/types/onboarding";

export type UiOnboardingStep =
  | "BASIC_INFO"
  | "BUSINESS_INFO"
  | "MODULE_RECOMMENDATION"
  | "MODULE_SELECT";

export function useOnboardingFlow() {
  const router = useRouter();
  const user = authStore((s) => s.user);
  const token = authStore((s) => s.token);
  const updateUser = authStore((s) => s.updateUser);
  const logout = authStore((s) => s.logout);

  const [uiStep, setUiStep] = useState<UiOnboardingStep>("BASIC_INFO");
  const [state, setState] = useState<OnboardingState | null>(null);
  const [catalog, setCatalog] = useState<{ modules: string[]; descriptions: Record<string, string> }>({
    modules: [],
    descriptions: {},
  });
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  const applyState = useCallback(
    (next: OnboardingState) => {
      setState(next);
      setUiStep(uiStepFromApi(next.nextStep ?? next.step));
      if (next.company?.modules?.length) {
        setSelectedModules(next.company.modules);
      } else if (next.recommendedModules.length) {
        setSelectedModules((prev) => (prev.length ? prev : next.recommendedModules));
      }
      const currentUser = authStore.getState().user;
      if (currentUser) {
        updateUser(mergeOnboardingIntoUser(currentUser, next));
      }
    },
    [updateUser],
  );

  /** Prevents bootstrap re-running when updateUser() replaces the user object. */
  const bootstrappedForRef = useRef<string | null>(null);
  const bootstrapInFlightRef = useRef(false);

  useEffect(() => {
    if (!token) {
      bootstrappedForRef.current = null;
      return;
    }

    if (!userId) {
      router.replace("/login");
      return;
    }

    if (bootstrappedForRef.current === userId || bootstrapInFlightRef.current) {
      return;
    }

    bootstrapInFlightRef.current = true;
    let cancelled = false;

    (async () => {
      try {
        const [remote, modules] = await Promise.all([
          onboardingApi.getOnboardingState(userId),
          onboardingApi.getModules().catch(() => ({ modules: [], descriptions: {} })),
        ]);
        if (cancelled) return;

        if (isOnboardingComplete(remote.step)) {
          bootstrappedForRef.current = userId;
          logout();
          router.replace(LOGIN_AFTER_ONBOARDING);
          return;
        }

        setCatalog(modules);
        applyState(remote);
        if (remote.recommendedModules.length) {
          setSelectedModules(remote.recommendedModules);
        }
        bootstrappedForRef.current = userId;
      } catch (err) {
        if (cancelled) return;
        setUiStep("BASIC_INFO");
        if (isAxiosError(err) && err.response?.status === 429) {
          setError(
            "The server is temporarily limiting requests (too many earlier attempts). Wait a few minutes, then refresh this page.",
          );
        } else {
          setError(
            err instanceof Error ? err.message : "We couldn't load your onboarding progress.",
          );
        }
      } finally {
        bootstrapInFlightRef.current = false;
        if (!cancelled) setIsBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
      bootstrapInFlightRef.current = false;
    };
    // applyState intentionally omitted — stable callback; including it can retrigger bootstrap.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap once per userId
  }, [logout, router, token, userId]);

  const run = async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const submitBasicInfo = async (values: BasicInfoForm) => {
    if (!authStore.getState().token) {
      setError("Your session expired. Please sign in again.");
      router.replace("/login?next=/onboarding");
      return;
    }
    if (!user?.id) {
      setError("We couldn't identify your account. Please sign in again.");
      return;
    }
    const next = await run(() => onboardingApi.updateBasicInfo(user.id, values));
    if (next) applyState(next);
  };

  const submitBusinessInfo = async (values: BusinessInfoForm) => {
    if (!user?.id) return;
    const next = await run(() =>
      onboardingApi.updateBusinessInfo(user.id, {
        businessName: values.businessName,
        industry: values.industry,
        teamSize: values.teamSize,
        monthlyLeads: values.monthlyLeads,
      }),
    );
    if (!next) return;

    applyState(next);

    const rec = await run(() =>
      onboardingApi.getRecommendations(user.id, {
        industry: values.industry,
        teamSize: values.teamSize,
      }),
    );
    if (rec) {
      applyState(rec);
      if (rec.recommendedModules.length) {
        setSelectedModules(rec.recommendedModules);
      }
      setUiStep("MODULE_RECOMMENDATION");
    }
  };

  const goToModuleSelect = () => setUiStep("MODULE_SELECT");

  const toggleModule = (mod: string) => {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod],
    );
  };

  const completeOnboarding = async () => {
    if (!user?.id) return;
    if (selectedModules.length === 0) {
      setError("Select at least one module to continue.");
      return;
    }

    const next = await run(() =>
      onboardingApi.selectModules({
        userId: user.id,
        selectedModules,
      }),
    );
    if (!next) return;

    if (next.company?.modules?.length) {
      setSelectedModules(next.company.modules);
    }
    applyState(next);
    markOnboardingCompleteInBrowser();

    logout();
    if (typeof window !== "undefined") {
      window.location.assign(LOGIN_AFTER_ONBOARDING);
      return;
    }
    router.replace(LOGIN_AFTER_ONBOARDING);
  };

  const stepIndex = ["BASIC_INFO", "BUSINESS_INFO", "MODULE_RECOMMENDATION", "MODULE_SELECT"].indexOf(
    uiStep,
  );

  return {
    user,
    state,
    catalog,
    uiStep,
    stepIndex,
    selectedModules,
    isBootstrapping,
    isLoading,
    error,
    setError,
    submitBasicInfo,
    submitBusinessInfo,
    goToModuleSelect,
    toggleModule,
    setSelectedModules,
    completeOnboarding,
  };
}
