"use client";

import { FormEvent, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
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
  "mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#191970] focus:bg-white focus:ring-2 focus:ring-[#191970]/10 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-950";

const selectClass =
  "mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-900 outline-none transition focus:border-[#191970] focus:bg-white focus:ring-2 focus:ring-[#191970]/10 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-950";

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-800 dark:text-slate-200">
        {label}
      </label>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p> : null}
      {children}
      {error ? <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}

function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
        aria-label="Close invite wizard"
        onClick={handleClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2 }}
        className="relative z-[1] flex h-[min(680px,92vh)] w-full max-w-[820px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        role="dialog"
        aria-labelledby="invite-wizard-title"
      >
        <aside className="hidden w-[220px] shrink-0 flex-col bg-gradient-to-b from-[#191970] to-[#12124a] sm:flex">
          <div className="border-b border-white/10 px-5 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Provisioning</p>
            <h2 id="invite-wizard-title" className="mt-1 text-[15px] font-semibold text-white">
              Invite member
            </h2>
          </div>
          <nav className="flex-1 space-y-0.5 px-3 py-4" aria-label="Wizard steps">
            {STEPS.map((s, i) => {
              const done = i < stepIndex;
              const current = s.id === step;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-3 py-2.5 transition",
                    current && "bg-white/10",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
                      done && "bg-emerald-400 text-[#12124a]",
                      current && !done && "bg-white text-[#191970]",
                      !done && !current && "bg-white/15 text-white/50",
                    )}
                  >
                    {done ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className={cn("block text-xs font-semibold", current ? "text-white" : "text-white/70")}>
                      {s.title}
                    </span>
                    <span className="block text-[10px] text-white/40">{s.hint}</span>
                  </span>
                </div>
              );
            })}
          </nav>
          <div className="border-t border-white/10 px-5 py-4">
            <p className="text-[10px] leading-relaxed text-white/45">
              Secure invite link · 72-hour expiry · MFA enforced by policy
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Progress bar */}
          <div className="h-1 shrink-0 bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-[#191970] transition-all duration-300"
              style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Step {stepIndex + 1} of {STEPS.length}
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{STEPS[stepIndex]?.title}</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                {step === "identity" ? (
                  <FormSection
                    title="Member identity"
                    description="Basic contact details for the invitation email."
                  >
                    <Field label="Full name" htmlFor="iw-name" error={errors.name}>
                      <input
                        id="iw-name"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="Jordan Lee"
                        className={inputClass}
                        autoFocus
                      />
                    </Field>
                    <Field
                      label="Work email"
                      htmlFor="iw-email"
                      hint="Must belong to your organization's verified domain."
                      error={errors.email}
                    >
                      <input
                        id="iw-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="jordan.lee@company.com"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Mobile number" htmlFor="iw-mobile" hint="Optional · used for MFA recovery">
                      <input
                        id="iw-mobile"
                        value={form.mobile}
                        onChange={(e) => set("mobile", e.target.value)}
                        placeholder="+1 555 000 0000"
                        className={inputClass}
                      />
                    </Field>
                  </FormSection>
                ) : null}

                {step === "organization" ? (
                  <FormSection
                    title="Role & placement"
                    description="Assign a profile role and organizational unit."
                  >
                    <Field label="Profile role" htmlFor="iw-role" error={errors.profileRole}>
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
                      <p className="mt-2 text-[11px] text-slate-500">
                        Permissions inherit from role template.{" "}
                        <Link
                          href={workspacePaths.role}
                          className="font-semibold text-[#191970] hover:underline dark:text-blue-400"
                          onClick={handleClose}
                        >
                          Manage roles →
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
                    <Field label="Reports to" htmlFor="iw-manager" hint="Optional · sets org hierarchy">
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
                  </FormSection>
                ) : null}

                {step === "access" ? (
                  <FormSection
                    title="Module access"
                    description="Select which workspace modules this member can access."
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
                      {WORKSPACE_ACCESS_MODULES.map((mod) => {
                        const on = modules.includes(mod.id);
                        return (
                          <button
                            key={mod.id}
                            type="button"
                            onClick={() => toggleModule(mod.id)}
                            className={cn(
                              "flex items-start gap-2.5 rounded-lg border p-3 text-left transition",
                              on
                                ? "border-[#191970]/30 bg-[#191970]/5 ring-1 ring-[#191970]/15"
                                : "border-slate-200 bg-slate-50/50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/50",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                                on ? "border-[#191970] bg-[#191970] text-white" : "border-slate-300 bg-white",
                              )}
                            >
                              {on ? <Check className="h-2.5 w-2.5" /> : null}
                            </span>
                            <span>
                              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                {mod.label}
                              </span>
                              <span className="mt-0.5 block text-[10px] leading-snug text-slate-500">
                                {mod.description}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {modules.length === 0 ? (
                      <p className="text-xs font-medium text-rose-600">Select at least one module to continue.</p>
                    ) : null}
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-200/70 bg-amber-50/40 p-3 dark:border-amber-900/30 dark:bg-amber-950/15">
                      <input
                        type="checkbox"
                        checked={form.kycPortalAccess}
                        onChange={(e) => set("kycPortalAccess", e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-amber-300 text-amber-600"
                      />
                      <span>
                        <span className="text-xs font-semibold text-amber-950 dark:text-amber-100">
                          Extended KYC portal access
                        </span>
                        <span className="mt-0.5 block text-[10px] text-amber-800/70 dark:text-amber-200/60">
                          Stage-gated permissions for compliance workflows.
                        </span>
                      </span>
                    </label>
                  </FormSection>
                ) : null}

                {step === "security" ? (
                  <FormSection title="Security policy" description="Login rules and access restrictions.">
                    <ToggleRow
                      label="Allow workspace login"
                      description="Member can sign in after accepting the invite"
                      checked={form.loginEnabled}
                      onChange={(v) => set("loginEnabled", v)}
                    />
                    <ToggleRow
                      label="Account active"
                      description="Inactive accounts are blocked from all modules"
                      checked={form.activeStatus}
                      onChange={(v) => set("activeStatus", v)}
                    />
                    <ToggleRow
                      label="Require MFA on first login"
                      description="Recommended for admin, finance, and compliance roles"
                      checked={requireMfa}
                      onChange={setRequireMfa}
                    />
                    <Field label="IP allowlist" htmlFor="iw-ips" hint="Optional · comma-separated IPv4 addresses">
                      <input
                        id="iw-ips"
                        value={form.allowedIps}
                        onChange={(e) => set("allowedIps", e.target.value)}
                        placeholder="203.0.113.0, 198.51.100.42"
                        className={inputClass}
                      />
                    </Field>
                  </FormSection>
                ) : null}

                {step === "review" ? (
                  <FormSection title="Review & send" description="Confirm provisioning details before sending.">
                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3 bg-gradient-to-r from-[#191970] to-indigo-800 px-4 py-3.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-sm font-bold text-white">
                          {form.name
                            .split(" ")
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{form.name || "—"}</p>
                          <p className="truncate text-xs text-white/70">{form.email || "—"}</p>
                        </div>
                      </div>
                      <dl className="divide-y divide-slate-100 dark:divide-slate-800">
                        <ReviewRow label="Profile role" value={form.profileRole} />
                        <ReviewRow label="Department" value={form.department || "—"} />
                        <ReviewRow label="Team" value={form.team || "—"} />
                        <ReviewRow label="Modules" value={reviewModules.join(", ") || "—"} />
                        <ReviewRow
                          label="Security"
                          value={[
                            form.loginEnabled ? "Login enabled" : "Login disabled",
                            form.activeStatus ? "Active" : "Inactive",
                            requireMfa ? "MFA required" : "MFA optional",
                          ].join(" · ")}
                        />
                      </dl>
                    </div>
                    <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200/70 bg-emerald-50/50 px-3.5 py-3 dark:border-emerald-900/30 dark:bg-emerald-950/15">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <p className="text-xs leading-relaxed text-emerald-900 dark:text-emerald-200">
                        A secure invitation email will be sent. The link expires in 72 hours.
                      </p>
                    </div>
                  </FormSection>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-3.5 dark:border-slate-800 dark:bg-slate-950 sm:px-6">
            <button
              type="button"
              onClick={stepIndex === 0 ? handleClose : back}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {stepIndex === 0 ? (
                "Cancel"
              ) : (
                <>
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </>
              )}
            </button>
            <div className="flex items-center gap-3">
              <span className="hidden text-[11px] text-slate-400 sm:inline">
                {stepIndex + 1} / {STEPS.length}
              </span>
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f0f4d]"
              >
                {step === "review" ? (
                  <>
                    <UserPlus className="h-3.5 w-3.5" />
                    Send invitation
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>
        </div>
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
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200/90 bg-slate-50/40 px-3.5 py-3 dark:border-slate-800 dark:bg-slate-900/30">
      <div>
        <p className="text-xs font-semibold text-slate-900 dark:text-white">{label}</p>
        <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition",
          checked ? "bg-[#191970]" : "bg-slate-300 dark:bg-slate-600",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition",
            checked ? "left-[18px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-xs">
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className="max-w-[55%] truncate text-right font-semibold text-slate-800 dark:text-slate-200">{value}</dd>
    </div>
  );
}
