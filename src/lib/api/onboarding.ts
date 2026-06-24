"use client";

import { isAxiosError } from "axios";

import { assertApiSuccess } from "@/lib/api/api-envelope";
import { apiClient } from "@/lib/api/client";
import {
  toBasicInfoBody,
  toBusinessInfoBody,
  toRecommendationsBody,
  toSelectModulesBody,
} from "@/lib/api/onboarding-payload";
import {
  normalizeModulesCatalog,
  normalizeOnboardingState,
  unwrapOnboarding,
  type NormalizeOnboardingContext,
} from "@/lib/api/onboarding-normalize";
import { authStore } from "@/stores/auth.store";
import type { BasicInfoForm, BusinessInfoForm } from "@/features/onboarding/schemas/onboarding.schema";
import type { OnboardingState } from "@/types/onboarding";

export type {
  OnboardingStep,
  OnboardingState,
  ProfileRole,
  OnboardingIndustry,
} from "@/types/onboarding";

export type RegisterOnboardingPayload = {
  email: string;
  password: string;
};

export type LoginOnboardingPayload = {
  email: string;
  password: string;
};

export type BasicInfoPayload = BasicInfoForm;

export type BusinessInfoPayload = BusinessInfoForm;

export type ModuleSelectionPayload = {
  userId: string;
  selectedModules: string[];
};

export type RecommendationsPayload = {
  industry: string;
  teamSize: number;
};

const onboardingError = (err: unknown, fallback: string): Error => {
  if (isAxiosError(err)) {
    const body = err.response?.data as { message?: string; error?: string } | undefined;
    return new Error(body?.message ?? body?.error ?? fallback);
  }
  if (err instanceof Error) return err;
  return new Error(fallback);
};

function readNormalizeContext(): NormalizeOnboardingContext {
  const user = authStore.getState().user;
  if (!user) return {};
  return {
    fallbackUserId: user.id && user.id !== "unknown" ? user.id : undefined,
    fallbackEmail: user.email,
    fallbackFullName: user.fullName ?? user.name,
    fallbackRole: user.profileRole,
  };
}

async function postState(path: string, body?: unknown): Promise<OnboardingState> {
  try {
    const { data } = await apiClient.post(path, body);
    assertApiSuccess(data as { success?: boolean; message?: string; error?: string });
    const state = normalizeOnboardingState(unwrapOnboarding(data), readNormalizeContext());
    if (!state) throw new Error("Invalid response from onboarding service.");
    return state;
  } catch (err) {
    throw onboardingError(err, "We couldn't save your progress. Please try again.");
  }
}

export const onboardingApi = {
  register: async (payload: RegisterOnboardingPayload): Promise<OnboardingState> =>
    postState("/onboarding/register", payload),

  login: async (payload: LoginOnboardingPayload): Promise<OnboardingState> =>
    postState("/onboarding/login", payload),

  updateBasicInfo: async (
    userId: string,
    payload: BasicInfoPayload,
  ): Promise<OnboardingState> =>
    postState("/onboarding/basic-info", toBasicInfoBody(userId, payload)),

  updateBusinessInfo: async (
    userId: string,
    payload: BusinessInfoPayload,
  ): Promise<OnboardingState> =>
    postState("/onboarding/business-info", toBusinessInfoBody(userId, payload)),

  selectModules: async (payload: ModuleSelectionPayload): Promise<OnboardingState> =>
    postState(
      "/onboarding/select-modules",
      toSelectModulesBody(payload.userId, payload.selectedModules),
    ),

  getRecommendations: async (
    userId: string,
    payload: RecommendationsPayload,
  ): Promise<OnboardingState> =>
    postState(
      "/onboarding/recommendations",
      toRecommendationsBody(userId, payload.industry, payload.teamSize),
    ),

  getOnboardingState: async (userId: string): Promise<OnboardingState> => {
    try {
      const { data } = await apiClient.get(`/onboarding/state/${userId}`);
      assertApiSuccess(data as { success?: boolean; message?: string; error?: string });
      const state = normalizeOnboardingState(unwrapOnboarding(data), {
        ...readNormalizeContext(),
        fallbackUserId: userId,
      });
      if (!state) throw new Error("Could not load onboarding progress.");
      return state;
    } catch (err) {
      throw onboardingError(err, "We couldn't load your onboarding progress.");
    }
  },

  getModules: async (): Promise<{ modules: string[]; descriptions: Record<string, string> }> => {
    try {
      const { data } = await apiClient.get("/onboarding/modules");
      return normalizeModulesCatalog(unwrapOnboarding(data));
    } catch (err) {
      throw onboardingError(err, "We couldn't load available modules.");
    }
  },
};
