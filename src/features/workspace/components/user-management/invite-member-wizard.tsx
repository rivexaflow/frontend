"use client";

import { FormEvent, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
  Shield,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";

import {
  DEFAULT_MODULES_BY_DEPARTMENT,
  WORKSPACE_ACCESS_MODULES,
  type WorkspaceModuleId,
} from "@/features/workspace/data/workspace-user-modules";
import {
  WORKSPACE_DEPARTMENTS,
  WORKSPACE_MANAGERS,
  WORKSPACE_TEAMS,
} from "@/features/workspace/data/workspace-user-form-options";
import type { WorkspaceUserRecord } from "@/features/workspace/data/workspace-users-demo";
import { WORKSPACE_PROFILE_ROLES } from "@/features/workspace/data/workspace-user-roles";
import {
  createWorkspaceUserSchema,
  type CreateWorkspaceUserInput,
} from "@/features/workspace/schemas/create-user.schema";
import { workspacePaths } from "@/lib/workspace/paths";
import { cn } from "@/lib/utils/cn";

const STEPS = [
  { id: "identity", title: "Identity", hint: "Who you're inviting" },
  { id: "organization", title: "Organization", hint: "Role & placement" },
  { id: "access", title: "Module access", hint: "What they can use" },
  { id: "security", title: "Security", hint: "Login & restrictions" },
  { id: "review", title: "Review", hint: "Confirm & send" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const defaultValues: CreateWorkspaceUserInput = {
  name: "",
  email: "",
  profileRole: "Sales Executive",
  department: "",
  team: "",
  reportingTo: "",
  mobile: "",
  extension1: "",
  extension2: "",
  loginEnabled: true,
  activeStatus: true,
  accessibleDepartments: "",
  accessibleUsers: "",
  allowedIps: "",
  kycPortalAccess: false,
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (user: WorkspaceUserRecord) => void;
};

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-[#4338ca] focus:ring-2 focus:ring-[#4338ca]/12 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const selectClass =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#4338ca] focus:ring-2 focus:ring-[#4338ca]/12 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}

export function InviteMemberWizard({ open, onClose, onCreated }: Props) {
  const [step, setStep] = useState<StepId>("identity");
  const [form, setForm] = useState<CreateWorkspaceUserInput>(defaultValues);
  const [modules, setModules] = useState<WorkspaceModuleId[]>(["crm"]);
  const [requireMfa, setRequireMfa] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateWorkspaceUserInput, string>>>({});

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const set = <K extends keyof CreateWorkspaceUserInput>(key: K, value: CreateWorkspaceUserInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (key === "department" && typeof value === "string" && value) {
      const suggested = DEFAULT_MODULES_BY_DEPARTMENT[value];
      if (suggested?.length) setModules(suggested);
    }
  };

  const toggleModule = (id: WorkspaceModuleId) => {
    setModules((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const reset = () => {
    setForm(defaultValues);
    setModules(["crm"]);
    setRequireMfa(true);
    setErrors({});
    setStep("identity");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validateStep = (): boolean => {
    if (step === "identity") {
      if (!form.name.trim()) {
        setErrors({ name: "Full name is required" });
        return false;
      }
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setErrors({ email: "Enter a valid work email" });
        return false;
      }
      return true;
    }
    if (step === "organization") {
      if (!form.profileRole) {
        setErrors({ profileRole: "Select a profile role" });
        return false;
      }
      return true;
    }
    if (step === "access" && modules.length === 0) return false;
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    const i = stepIndex + 1;
    if (i < STEPS.length) setStep(STEPS[i]!.id);
  };

  const back = () => {
    const i = stepIndex - 1;
    if (i >= 0) setStep(STEPS[i]!.id);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step !== "review") {
      next();
      return;
    }

    const parsed = createWorkspaceUserSchema.safeParse(form);
    if (!parsed.success) {
      const nextErr: Partial<Record<keyof CreateWorkspaceUserInput, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof CreateWorkspaceUserInput;
        if (key && !nextErr[key]) nextErr[key] = issue.message;
      });
      setErrors(nextErr);
      return;
    }

    const data = parsed.data;
    const newUser: WorkspaceUserRecord = {
      id: `u_${Date.now()}`,
      name: data.name,
      email: data.email,
      profileRole: data.profileRole,
      status: data.activeStatus ? (data.loginEnabled ? "invited" : "suspended") : "suspended",
      lastActive: "—",
      department: data.department || "Operations",
      team: data.team || undefined,
      modules: modules.length ? modules : ["crm"],
      joinedAt: "Pending",
      mfaEnabled: requireMfa,
      mobile: data.mobile || undefined,
    };
    onCreated(newUser);
    handleClose();
  };

  const reviewModules = useMemo(
    () =>
      modules.map((id) => WORKSPACE_ACCESS_MODULES.find((m) => m.id === id)?.label).filter(Boolean),
    [modules],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Close invite wizard"
        onClick={handleClose}
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        className="relative z-[1] flex h-full w-full max-w-[520px] flex-col border-l border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        role="dialog"
        aria-labelledby="invite-wizard-title"
      >
        <header className="shrink-0 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4338ca]">
                Member onboarding
              </p>
              <h2 id="invite-wizard-title" className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">
                Invite workspace member
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Step {stepIndex + 1} of {STEPS.length} — {STEPS[stepIndex]?.hint}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="mt-4 flex gap-1 overflow-x-auto pb-1" aria-label="Wizard steps">
            {STEPS.map((s, i) => {
              const done = i < stepIndex;
              const current = s.id === step;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-center",
                    current && "bg-blue-50 dark:bg-blue-950/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                      done && "bg-emerald-500 text-white",
                      current && !done && "bg-[#191970] text-white",
                      !done && !current && "bg-slate-200 text-slate-500 dark:bg-slate-800",
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className="truncate text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                    {s.title}
                  </span>
                </div>
              );
            })}
          </nav>
        </header>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                {step === "identity" ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/90 to-indigo-50/50 p-4 dark:border-blue-900/40 dark:from-blue-950/30 dark:to-indigo-950/20">
                      <div className="flex gap-3">
                        <Sparkles className="h-5 w-5 shrink-0 text-blue-600" />
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                          We&apos;ll send a secure invite link. The member completes profile setup on first sign-in.
                        </p>
                      </div>
                    </div>
                    <Field label="Full name *" htmlFor="iw-name" error={errors.name}>
                      <input
                        id="iw-name"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="e.g. Jordan Lee"
                        className={inputClass}
                        autoFocus
                      />
                    </Field>
                    <Field label="Work email *" htmlFor="iw-email" error={errors.email}>
                      <input
                        id="iw-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="jordan.lee@company.com"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Mobile (optional)" htmlFor="iw-mobile">
                      <input
                        id="iw-mobile"
                        value={form.mobile}
                        onChange={(e) => set("mobile", e.target.value)}
                        placeholder="+1 555 000 0000"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                ) : null}

                {step === "organization" ? (
                  <div className="space-y-4">
                    <Field label="Profile role *" htmlFor="iw-role" error={errors.profileRole}>
                      <select
                        id="iw-role"
                        value={form.profileRole}
                        onChange={(e) =>
                          set("profileRole", e.target.value as CreateWorkspaceUserInput["profileRole"])
                        }
                        className={selectClass}
                      >
                        {WORKSPACE_PROFILE_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-xs text-slate-500">
                        Permissions inherit from the role template.{" "}
                        <Link
                          href={workspacePaths.role}
                          className="font-semibold text-blue-600 hover:underline"
                          onClick={handleClose}
                        >
                          Manage roles
                        </Link>
                      </p>
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Department" htmlFor="iw-dept">
                        <select
                          id="iw-dept"
                          value={form.department}
                          onChange={(e) => set("department", e.target.value)}
                          className={selectClass}
                        >
                          <option value="">Select department</option>
                          {WORKSPACE_DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Team" htmlFor="iw-team">
                        <select
                          id="iw-team"
                          value={form.team}
                          onChange={(e) => set("team", e.target.value)}
                          className={selectClass}
                        >
                          <option value="">Select team</option>
                          {WORKSPACE_TEAMS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label="Reports to" htmlFor="iw-manager">
                      <select
                        id="iw-manager"
                        value={form.reportingTo}
                        onChange={(e) => set("reportingTo", e.target.value)}
                        className={selectClass}
                      >
                        <option value="">Select manager</option>
                        {WORKSPACE_MANAGERS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                ) : null}

                {step === "access" ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">
                      Grant module access aligned to their function. You can refine per-user overrides later.
                    </p>
                    <div className="grid gap-2">
                      {WORKSPACE_ACCESS_MODULES.map((mod) => {
                        const on = modules.includes(mod.id);
                        return (
                          <button
                            key={mod.id}
                            type="button"
                            onClick={() => toggleModule(mod.id)}
                            className={cn(
                              "flex items-start gap-3 rounded-xl border p-3.5 text-left transition",
                              on
                                ? "border-blue-300 bg-blue-50/80 ring-1 ring-blue-500/20 dark:border-blue-800 dark:bg-blue-950/40"
                                : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                                on ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300",
                              )}
                            >
                              {on ? <Check className="h-3 w-3" /> : null}
                            </span>
                            <span>
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                {mod.label}
                              </span>
                              <span className="mt-0.5 block text-xs text-slate-500">{mod.description}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {modules.length === 0 ? (
                      <p className="text-xs font-medium text-rose-600">Select at least one module.</p>
                    ) : null}
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                      <input
                        type="checkbox"
                        checked={form.kycPortalAccess}
                        onChange={(e) => set("kycPortalAccess", e.target.checked)}
                        className="h-4 w-4 rounded border-amber-300 text-amber-600"
                      />
                      <span className="text-xs font-medium text-amber-950 dark:text-amber-100">
                        Extended KYC portal permissions (stage-gated)
                      </span>
                    </label>
                  </div>
                ) : null}

                {step === "security" ? (
                  <div className="space-y-4">
                    <ToggleRow
                      label="Allow workspace login"
                      description="Member can sign in after accepting invite"
                      checked={form.loginEnabled}
                      onChange={(v) => set("loginEnabled", v)}
                    />
                    <ToggleRow
                      label="Account active"
                      description="Inactive accounts cannot access any module"
                      checked={form.activeStatus}
                      onChange={(v) => set("activeStatus", v)}
                    />
                    <ToggleRow
                      label="Require MFA on first login"
                      description="Recommended for revenue, compliance, and admin roles"
                      checked={requireMfa}
                      onChange={setRequireMfa}
                    />
                    <Field label="IP allowlist (optional)" htmlFor="iw-ips">
                      <input
                        id="iw-ips"
                        value={form.allowedIps}
                        onChange={(e) => set("allowedIps", e.target.value)}
                        placeholder="203.0.113.0, 198.51.100.42"
                        className={inputClass}
                      />
                      <p className="mt-1.5 text-[11px] text-slate-500">Leave empty for no IP restriction.</p>
                    </Field>
                  </div>
                ) : null}

                {step === "review" ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                      <div className="flex items-center gap-3 border-b border-slate-200/80 pb-3 dark:border-slate-700">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#191970] text-sm font-bold text-white">
                          {form.name
                            .split(" ")
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{form.name || "—"}</p>
                          <p className="text-xs text-slate-500">{form.email || "—"}</p>
                        </div>
                      </div>
                      <dl className="mt-3 space-y-2 text-xs">
                        <ReviewRow label="Profile role" value={form.profileRole} />
                        <ReviewRow label="Department" value={form.department || "—"} />
                        <ReviewRow label="Team" value={form.team || "—"} />
                        <ReviewRow label="Modules" value={reviewModules.join(", ") || "—"} />
                        <ReviewRow
                          label="Security"
                          value={[
                            form.loginEnabled ? "Login on" : "Login off",
                            form.activeStatus ? "Active" : "Inactive",
                            requireMfa ? "MFA required" : "MFA optional",
                          ].join(" · ")}
                        />
                      </dl>
                    </div>
                    <div className="flex items-start gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                      <Mail className="h-4 w-4 shrink-0" />
                      An invitation email will be sent with a 72-hour secure link.
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
            <button
              type="button"
              onClick={stepIndex === 0 ? handleClose : back}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              {stepIndex === 0 ? (
                "Cancel"
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </>
              )}
            </button>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#191970] px-5 text-sm font-semibold text-white shadow-md hover:bg-[#0f0f4d]"
            >
              {step === "review" ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  Send invitation
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </footer>
        </form>
      </motion.div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-[#191970]" : "bg-slate-300 dark:bg-slate-600",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="max-w-[58%] text-right font-semibold text-slate-800 dark:text-slate-200">{value}</dd>
    </div>
  );
}
