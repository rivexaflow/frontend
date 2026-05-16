"use client";

import { apiClient } from "@/lib/api/client";

export type OnboardingStep = "BASIC_INFO" | "BUSINESS_INFO" | "MODULE_RECOMMENDATION" | "MODULE_SELECT" | "DONE";

export type BasicInfoPayload = {
  userId: string;
  fullName: string;
  role: string;
};

export type BusinessInfoPayload = {
  userId: string;
  businessName: string;
  industry: string;
  teamSize: number;
  monthlyLeads?: number;
};

export type ModuleSelectionPayload = {
  userId: string;
  selectedModules: string[];
};

export const onboardingApi = {
  updateBasicInfo: async (payload: BasicInfoPayload) => {
    const { data } = await apiClient.post("/onboarding/basic-info", payload);
    return data;
  },

  updateBusinessInfo: async (payload: BusinessInfoPayload) => {
    const { data } = await apiClient.post("/onboarding/business-info", payload);
    return data;
  },

  selectModules: async (payload: ModuleSelectionPayload) => {
    const { data } = await apiClient.post("/onboarding/select-modules", payload);
    return data;
  },

  getOnboardingState: async (userId: string) => {
    const { data } = await apiClient.get(`/onboarding/state/${userId}`);
    return data;
  },
};
