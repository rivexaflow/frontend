"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authStore } from "@/stores/auth.store";

export default function OnboardingPage() {
  const router = useRouter();
  const user = authStore((s) => s.user);

  console.log("Onboarding page hit, user:", user);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xl">
          R
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name || "there"}!</h1>
        <p className="mt-2 text-slate-600">
          We're setting up your enterprise AI workspace. Please complete the following steps to get started.
        </p>
        
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-4 rounded-lg border border-slate-100 p-4 transition-colors hover:bg-slate-50">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">1</div>
            <div>
              <p className="font-semibold text-slate-900">Basic Information</p>
              <p className="text-xs text-slate-500">Tell us about yourself and your role</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 rounded-lg border border-slate-100 p-4 opacity-50">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 font-semibold text-sm">2</div>
            <div>
              <p className="font-semibold text-slate-900">Business Details</p>
              <p className="text-xs text-slate-500">Register your company or organization</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 rounded-lg border border-slate-100 p-4 opacity-50">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 font-semibold text-sm">3</div>
            <div>
              <p className="font-semibold text-slate-900">Module Selection</p>
              <p className="text-xs text-slate-500">Choose the tools you need (CRM, KYC, etc.)</p>
            </div>
          </div>
        </div>

        <button className="mt-10 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700">
          Start Onboarding
        </button>
      </div>
    </div>
  );
}
