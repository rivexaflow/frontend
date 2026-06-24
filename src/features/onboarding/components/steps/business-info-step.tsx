"use client";

import { FormEvent, useState } from "react";
import { Building2 } from "lucide-react";

import {
  businessInfoSchema,
  type BusinessInfoForm,
} from "@/features/onboarding/schemas/onboarding.schema";
import type { OnboardingIndustry } from "@/types/onboarding";

const INDUSTRIES: { value: OnboardingIndustry; label: string }[] = [
  { value: "real_estate", label: "Real estate" },
  { value: "saas", label: "SaaS / Software" },
  { value: "consulting", label: "Consulting" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "other", label: "Other" },
];

type BusinessInfoStepProps = {
  initial?: Partial<BusinessInfoForm>;
  isLoading: boolean;
  error: string | null;
  onSubmit: (values: BusinessInfoForm) => Promise<void>;
};

export function BusinessInfoStep({ initial, isLoading, error, onSubmit }: BusinessInfoStepProps) {
  const [businessName, setBusinessName] = useState(initial?.businessName ?? "");
  const [industry, setIndustry] = useState<OnboardingIndustry | "">(
    (initial?.industry as OnboardingIndustry) ?? "",
  );
  const [teamSize, setTeamSize] = useState(String(initial?.teamSize ?? 1));
  const [monthlyLeads, setMonthlyLeads] = useState(
    initial?.monthlyLeads !== undefined ? String(initial.monthlyLeads) : "",
  );
  const [logo, setLogo] = useState(initial?.logo ?? "");
  const [logoError, setLogoError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setLogoError("Please upload a PNG or SVG image.");
      return;
    }

    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      setLogoError("Logo size must be less than 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setLogo(event.target.result);
      }
    };
    reader.onerror = () => {
      setLogoError("Failed to read logo file.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (logoError) return;
    const parsed = businessInfoSchema.safeParse({
      businessName,
      industry,
      teamSize,
      monthlyLeads: monthlyLeads === "" ? undefined : monthlyLeads,
      logo: logo || undefined,
    });
    if (!parsed.success) {
      const errs: Partial<Record<string, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    await onSubmit(parsed.data);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Tell us about your business
        </h2>
        <p className="mt-2 max-w-lg text-slate-500">
          We&apos;ll create your company workspace and recommend the right modules for your team.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <label htmlFor="businessName" className="text-sm font-semibold text-slate-700">
            Business name
          </label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
          {fieldErrors.businessName && (
            <p className="text-sm text-rose-600">{fieldErrors.businessName}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="industry" className="text-sm font-semibold text-slate-700">
              Industry
            </label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value as OnboardingIndustry)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </select>
            {fieldErrors.industry && (
              <p className="text-sm text-rose-600">{fieldErrors.industry}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="teamSize" className="text-sm font-semibold text-slate-700">
              Team size
            </label>
            <input
              id="teamSize"
              type="number"
              min={1}
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
            {fieldErrors.teamSize && (
              <p className="text-sm text-rose-600">{fieldErrors.teamSize}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="monthlyLeads" className="text-sm font-semibold text-slate-700">
            Monthly leads <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="monthlyLeads"
            type="number"
            min={0}
            value={monthlyLeads}
            onChange={(e) => setMonthlyLeads(e.target.value)}
            placeholder="e.g. 50"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="logo-upload" className="text-sm font-semibold text-slate-700 block">
            Company logo <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <div className="mt-1 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-1">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="Company logo preview" className="max-h-full max-w-full object-contain" />
              ) : (
                <Building2 className="h-6 w-6 text-slate-400" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <input
                id="logo-upload"
                type="file"
                accept="image/png, image/svg+xml"
                onChange={handleLogoChange}
                className="hidden"
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none"
              >
                Choose logo file
              </label>
              <p className="text-[10px] text-slate-400">
                Recommended: Square (PNG or SVG, Max 1MB)
              </p>
            </div>
            {logo && (
              <button
                type="button"
                onClick={() => setLogo("")}
                className="text-xs text-rose-500 font-semibold hover:text-rose-600 transition"
              >
                Remove
              </button>
            )}
          </div>
          {logoError && (
            <p className="text-sm text-rose-600">{logoError}</p>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 disabled:opacity-60"
        >
          {isLoading ? "Creating company…" : "Get module recommendations"}
        </button>
      </form>
    </div>
  );
}
