"use client";

import { OnboardingShell } from "@/features/onboarding/components/onboarding-shell";
import { BasicInfoStep } from "@/features/onboarding/components/steps/basic-info-step";
import { BusinessInfoStep } from "@/features/onboarding/components/steps/business-info-step";
import { ModuleRecommendationStep } from "@/features/onboarding/components/steps/module-recommendation-step";
import { ModuleSelectStep } from "@/features/onboarding/components/steps/module-select-step";
import { useOnboardingFlow } from "@/features/onboarding/hooks/use-onboarding-flow";
import { coerceProfileRole } from "@/lib/api/onboarding-payload";

export function OnboardingView() {
  const flow = useOnboardingFlow();

  if (flow.isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4ff]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-600">Loading your setup…</p>
        </div>
      </div>
    );
  }

  return (
    <OnboardingShell activeStepId={flow.uiStep} stepIndex={flow.stepIndex}>
      {flow.uiStep === "BASIC_INFO" && (
        <BasicInfoStep
          initialFullName={flow.state?.user.fullName ?? flow.user?.fullName ?? flow.user?.name}
          initialRole={coerceProfileRole(flow.state?.user.role, flow.user?.profileRole)}
          isLoading={flow.isLoading}
          error={flow.error}
          onSubmit={flow.submitBasicInfo}
        />
      )}

      {flow.uiStep === "BUSINESS_INFO" && (
        <BusinessInfoStep
          initial={{
            businessName: flow.state?.company?.name,
            industry: flow.state?.company?.industry as never,
            teamSize: flow.state?.company?.teamSize,
            logo: flow.state?.company?.logo,
          }}
          isLoading={flow.isLoading}
          error={flow.error}
          onSubmit={flow.submitBusinessInfo}
        />
      )}

      {flow.uiStep === "MODULE_RECOMMENDATION" && (
        <ModuleRecommendationStep
          recommended={
            flow.state?.recommendedModules.length
              ? flow.state.recommendedModules
              : flow.catalog.modules.slice(0, 4)
          }
          descriptions={flow.catalog.descriptions}
          selectedModules={flow.selectedModules}
          isLoading={flow.isLoading}
          error={flow.error}
          onToggle={flow.toggleModule}
          onContinue={flow.goToModuleSelect}
        />
      )}

      {flow.uiStep === "MODULE_SELECT" && (
        <ModuleSelectStep
          available={
            flow.state?.availableModules.length
              ? flow.state.availableModules
              : flow.catalog.modules
          }
          descriptions={flow.catalog.descriptions}
          selectedModules={flow.selectedModules}
          isLoading={flow.isLoading}
          error={flow.error}
          onToggle={flow.toggleModule}
          onComplete={flow.completeOnboarding}
        />
      )}
    </OnboardingShell>
  );
}
