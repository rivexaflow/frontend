"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { authStore } from "@/stores/auth.store";
import { onboardingApi, OnboardingStep } from "@/lib/api/onboarding";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "BASIC_INFO", title: "Personal Info", icon: "👤" },
  { id: "BUSINESS_INFO", title: "Business Setup", icon: "🏢" },
  { id: "MODULE_SELECT", title: "Tools & Modules", icon: "🛠️" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const user = authStore((s) => s.user);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("BASIC_INFO");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    role: "",
    businessName: "",
    industry: "",
    teamSize: 1,
    selectedModules: [] as string[],
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Sync current step with backend state on mount
    const syncState = async () => {
      try {
        const state = await onboardingApi.getOnboardingState(user.id);
        if (state.success && state.data.step !== "DONE") {
          setCurrentStep(state.data.step);
          if (state.data.user?.fullName) {
            setFormData(prev => ({ ...prev, fullName: state.data.user.fullName }));
          }
        } else if (state.data.step === "DONE") {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Failed to sync onboarding state", err);
      }
    };
    syncState();
  }, [user, router]);

  const handleBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await onboardingApi.updateBasicInfo({
        userId: user.id,
        fullName: formData.fullName,
        role: formData.role,
      });
      if (res.success) setCurrentStep("BUSINESS_INFO");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBusinessInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await onboardingApi.updateBusinessInfo({
        userId: user.id,
        businessName: formData.businessName,
        industry: formData.industry,
        teamSize: formData.teamSize,
      });
      if (res.success) setCurrentStep("MODULE_SELECT");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save business details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModuleSelection = async () => {
    if (!user) return;
    if (formData.selectedModules.length === 0) {
      setError("Please select at least one module");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await onboardingApi.selectModules({
        userId: user.id,
        selectedModules: formData.selectedModules,
      });
      if (res.success) {
        authStore.getState().setSession({
           ...authStore.getState()!,
           user: { ...user, onboardingStep: 'DONE' }
        } as any);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save modules");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModule = (mod: string) => {
    setFormData(prev => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(mod)
        ? prev.selectedModules.filter(m => m !== mod)
        : [...prev.selectedModules, mod]
    }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-4 lg:p-8">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-200/60 lg:flex">
        
        {/* Sidebar Status */}
        <div className="bg-[#0f172a] p-8 text-white lg:w-80">
          <div className="mb-12 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500 font-bold text-white flex items-center justify-center text-xl">R</div>
            <span className="text-xl font-bold tracking-tight">Rivexaflow</span>
          </div>

          <nav className="space-y-8">
            {STEPS.map((step, idx) => {
              const isCompleted = STEPS.findIndex(s => s.id === currentStep) > idx;
              const isActive = step.id === currentStep;

              return (
                <div key={step.id} className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : 
                    isActive ? "border-blue-500 text-blue-500 scale-110 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : 
                    "border-slate-700 text-slate-500"
                  )}>
                    {isCompleted ? "✓" : step.icon}
                  </div>
                  <div>
                    <p className={cn("text-xs font-bold uppercase tracking-widest", isActive ? "text-blue-400" : "text-slate-500")}>Step {idx + 1}</p>
                    <p className={cn("font-semibold", isActive ? "text-white" : "text-slate-400")}>{step.title}</p>
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="mt-20 rounded-2xl bg-slate-800/50 p-6 text-sm text-slate-400">
            <p>Need help? Our onboarding specialist is available at <span className="text-blue-400 underline cursor-pointer">support@rivexa.com</span></p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 lg:p-12">
          <AnimatePresence mode="wait">
            {currentStep === "BASIC_INFO" && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Personalize your experience</h2>
                  <p className="mt-2 text-slate-500">Welcome to the future of enterprise AI. Let's start with the basics.</p>
                </div>

                <form onSubmit={handleBasicInfo} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <input
                      required
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Your Role</label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    >
                      <option value="">Select your role</option>
                      <option value="owner">Business Owner</option>
                      <option value="manager">Manager</option>
                      <option value="freelancer">Freelancer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {error && <p className="text-sm font-medium text-rose-500">⚠️ {error}</p>}

                  <button
                    disabled={isLoading}
                    className="mt-6 w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 hover:translate-y-[-2px] active:translate-y-[0px] disabled:opacity-70"
                  >
                    {isLoading ? "Saving..." : "Continue to Business Setup"}
                  </button>
                </form>
              </motion.div>
            )}

            {currentStep === "BUSINESS_INFO" && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Tell us about your business</h2>
                  <p className="mt-2 text-slate-500">We'll configure your workspace based on your industry.</p>
                </div>

                <form onSubmit={handleBusinessInfo} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Business Name</label>
                    <input
                      required
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Industry</label>
                      <select
                        required
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      >
                        <option value="">Select industry</option>
                        <option value="saas">SaaS / Software</option>
                        <option value="real_estate">Real Estate</option>
                        <option value="consulting">Consulting</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Team Size</label>
                      <input
                        required
                        type="number"
                        min="1"
                        value={formData.teamSize}
                        onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                  </div>

                  {error && <p className="text-sm font-medium text-rose-500">⚠️ {error}</p>}

                  <button
                    disabled={isLoading}
                    className="mt-6 w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 hover:translate-y-[-2px] active:translate-y-[0px] disabled:opacity-70"
                  >
                    {isLoading ? "Creating Company..." : "Configure My Tools"}
                  </button>
                </form>
              </motion.div>
            )}

            {currentStep === "MODULE_SELECT" && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Choose your toolkit</h2>
                  <p className="mt-2 text-slate-500">Select the modules you want to activate in your workspace.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {["CRM", "KYC", "Invoice", "AI Agents", "WhatsApp", "Email Marketing", "Analytics"].map((mod) => (
                    <div
                      key={mod}
                      onClick={() => toggleModule(mod)}
                      className={cn(
                        "cursor-pointer rounded-xl border-2 p-4 transition-all",
                        formData.selectedModules.includes(mod) 
                          ? "border-blue-500 bg-blue-50 shadow-md" 
                          : "border-slate-100 bg-white hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{mod}</span>
                        {formData.selectedModules.includes(mod) && <span className="text-blue-500 text-xl font-bold">✓</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {error && <p className="text-sm font-medium text-rose-500">⚠️ {error}</p>}

                <button
                  onClick={handleModuleSelection}
                  disabled={isLoading || formData.selectedModules.length === 0}
                  className="mt-6 w-full rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-700 hover:translate-y-[-2px] active:translate-y-[0px] disabled:opacity-70"
                >
                  {isLoading ? "Finalizing Setup..." : "Launch My Dashboard"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
