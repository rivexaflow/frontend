"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Briefcase,
  Building2,
  Camera,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
  selectClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import {
  HRM_EMPLOYMENT_STATUSES,
  HRM_EMPLOYMENT_TYPES,
  HRM_WORK_MODES,
} from "@/features/workspace/data/hrm-employees-demo";
import {
  type AddEmployeeFormStep,
  type AddEmployeeFormValues,
  buildFullName,
  validateAddEmployeeForm,
  validateAddEmployeeStep,
} from "@/features/workspace/schemas/employee.schema";
import type { CreateEmployeePayload, HrmDepartment, HrmEmploymentStatus, HrmEmploymentType, HrmRole, HrmWorkMode } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

type FormValues = AddEmployeeFormValues;
type FieldErrors = Partial<Record<keyof FormValues, string>>;

const STEPS: { id: AddEmployeeFormStep; label: string; icon: typeof UserRound }[] = [
  { id: "basic", label: "Basic information", icon: UserRound },
  { id: "employment", label: "Employment", icon: Briefcase },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "contact", label: "Contact", icon: MapPin },
];

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];
const MARITAL_OPTIONS = ["Single", "Married", "Divorced", "Widowed"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EMPTY: FormValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  preferredName: "",
  gender: "",
  dateOfBirth: "",
  maritalStatus: "",
  nationality: "",
  bloodGroup: "",
  personalEmail: "",
  personalMobile: "",
  profilePicturePreview: "",
  email: "",
  phone: "",
  designation: "",
  departmentId: "",
  departmentName: "",
  employmentType: "full_time",
  employmentStatus: "probation",
  joiningDate: new Date().toISOString().slice(0, 10),
  confirmationDate: "",
  employeeCategory: "",
  teamLead: "",
  location: "",
  officeBranch: "",
  costCenter: "",
  gradeBand: "",
  shiftAssignment: "",
  workMode: "hybrid",
  managerId: "",
  hrRoleId: "",
  businessUnit: "",
  division: "",
  team: "",
  skipLevelManager: "",
  hrManager: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  emergencyName: "",
  emergencyRelationship: "",
  emergencyMobile: "",
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateEmployeePayload) => Promise<void>;
  managers: { id: string; name: string; designation: string }[];
  departments: HrmDepartment[];
  roles: HrmRole[];
  locations: string[];
  nextEmployeeCode: string;
};

function fieldClass(hasError?: boolean) {
  return cn(
    hasError
      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15"
      : "focus:border-[#191970] focus:ring-[#191970]/15",
  );
}

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "?";
}

export function AddEmployeeModal({
  open,
  onClose,
  onSubmit,
  managers,
  departments,
  roles,
  locations,
  nextEmployeeCode,
}: Props) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [step, setStep] = useState<AddEmployeeFormStep>("basic");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValues({ ...EMPTY, joiningDate: new Date().toISOString().slice(0, 10) });
      setStep("basic");
      setFieldErrors({});
      setSubmitError(null);
      setSubmitting(false);
    }
  }, [open]);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (submitError) setSubmitError(null);
  };

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const isLastStep = stepIndex === STEPS.length - 1;

  const goNext = () => {
    const validation = validateAddEmployeeStep(step, values);
    if (!validation.success) {
      setFieldErrors(validation.errors);
      return;
    }
    setFieldErrors({});
    if (!isLastStep) setStep(STEPS[stepIndex + 1].id);
  };

  const goBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].id);
  };

  const handlePhotoChange = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("profilePicturePreview", String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validateAddEmployeeForm(values);
    if (!validation.success) {
      setFieldErrors(validation.errors);
      const firstErrorStep = STEPS.find((s) =>
        validateAddEmployeeStep(s.id, values).success === false &&
        Object.keys(validateAddEmployeeStep(s.id, values).errors).length > 0,
      );
      if (firstErrorStep) setStep(firstErrorStep.id);
      return;
    }

    const data = validation.data;
    const selectedDept = departments.find((d) => d.id === data.departmentId);
    const fullName = buildFullName(data);

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        fullName,
        email: data.email.toLowerCase(),
        phone: data.phone?.trim() || data.personalMobile?.trim() || undefined,
        employeeCode: nextEmployeeCode,
        designation: data.designation,
        departmentId: data.departmentId || undefined,
        department: selectedDept?.name ?? (data.departmentName?.trim() || undefined),
        location: data.location?.trim() || data.officeBranch?.trim() || undefined,
        managerId: data.managerId || null,
        hrRoleId: data.hrRoleId || null,
        employmentType: data.employmentType,
        status: data.employmentStatus as HrmEmploymentStatus,
        workMode: data.workMode,
        joiningDate: data.joiningDate,
      });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not create employee.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayName = buildFullName(values) || "New employee";

  return (
    <EnterpriseFormModal
      open={open}
      title="Add employee"
      description="Complete all sections to create a full employee record. Additional details can be edited on the profile page."
      onClose={onClose}
      size="full"
      flush
    >
      <form onSubmit={handleSubmit} className="flex min-h-[520px] flex-col">
        <div className="grid flex-1 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Left — profile preview + step nav */}
          <aside className="border-b border-slate-100 bg-gradient-to-b from-[#191970]/[0.04] to-transparent p-5 dark:border-slate-800 lg:border-b-0 lg:border-r">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative shrink-0"
                title="Upload profile picture"
              >
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#191970] via-indigo-500 to-violet-400 opacity-70 blur-[1px]" />
                <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#191970] text-xl font-bold text-white ring-4 ring-white dark:ring-slate-900">
                  {values.profilePicturePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={values.profilePicturePreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(values.firstName, values.lastName)
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 transition group-hover:opacity-100">
                    <Camera className="h-5 w-5 text-white" />
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
                />
              </button>
              <div className="min-w-0 pt-1">
                <p className="truncate text-base font-bold text-slate-900 dark:text-white">{displayName}</p>
                <p className="mt-0.5 font-mono text-[11px] font-semibold text-[#191970]">{nextEmployeeCode}</p>
                <p className="mt-1 text-xs text-slate-500">{values.designation || "Designation pending"}</p>
              </div>
            </div>

            <nav className="mt-6 space-y-1">
              {STEPS.map((s, idx) => {
                const active = step === s.id;
                const done = idx < stepIndex;
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      if (idx <= stepIndex) setStep(s.id);
                    }}
                    className={cn(
                      "relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                      active
                        ? "bg-[#191970] text-white shadow-md shadow-[#191970]/20"
                        : done
                          ? "text-[#191970] hover:bg-[#191970]/5 dark:text-indigo-300"
                          : "text-slate-400",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{s.label}</span>
                    {done && !active ? (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    ) : null}
                  </button>
                );
              })}
            </nav>

            <div className="mt-5 flex items-start gap-2 rounded-xl border border-[#191970]/15 bg-[#191970]/[0.04] px-3 py-2.5">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#191970]" />
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                New hires default to <strong>Probation</strong>. Complete documents on the full profile after creation.
              </p>
            </div>
          </aside>

          {/* Right — step content */}
          <div className="flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex-1 space-y-4 p-5"
              >
                {step === "basic" ? (
                  <>
                    <StepHeader title="Basic information" description="Required identity and personal contact fields." />
                    <FieldGrid>
                      <FormField label="Employee ID" htmlFor="emp-code">
                        <input id="emp-code" value={nextEmployeeCode} readOnly className={cn(inputClassName, "cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-slate-900/60")} />
                      </FormField>
                      <div className="hidden sm:block" />
                      <FormField label="First name *" htmlFor="emp-first" error={fieldErrors.firstName}>
                        <input id="emp-first" value={values.firstName} onChange={(e) => set("firstName", e.target.value)} className={cn(inputClassName, fieldClass(Boolean(fieldErrors.firstName)))} placeholder="Alex" disabled={submitting} />
                      </FormField>
                      <FormField label="Middle name" htmlFor="emp-middle">
                        <input id="emp-middle" value={values.middleName ?? ""} onChange={(e) => set("middleName", e.target.value)} className={inputClassName} placeholder="Optional" disabled={submitting} />
                      </FormField>
                      <FormField label="Last name *" htmlFor="emp-last" error={fieldErrors.lastName}>
                        <input id="emp-last" value={values.lastName} onChange={(e) => set("lastName", e.target.value)} className={cn(inputClassName, fieldClass(Boolean(fieldErrors.lastName)))} placeholder="Morgan" disabled={submitting} />
                      </FormField>
                      <FormField label="Preferred name" htmlFor="emp-preferred">
                        <input id="emp-preferred" value={values.preferredName ?? ""} onChange={(e) => set("preferredName", e.target.value)} className={inputClassName} placeholder="What they go by" disabled={submitting} />
                      </FormField>
                      <FormField label="Gender" htmlFor="emp-gender">
                        <select id="emp-gender" value={values.gender ?? ""} onChange={(e) => set("gender", e.target.value)} className={selectClassName} disabled={submitting}>
                          <option value="">Select…</option>
                          {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </FormField>
                      <FormField label="Date of birth" htmlFor="emp-dob">
                        <input id="emp-dob" type="date" value={values.dateOfBirth ?? ""} onChange={(e) => set("dateOfBirth", e.target.value)} className={inputClassName} disabled={submitting} />
                      </FormField>
                      <FormField label="Marital status" htmlFor="emp-marital">
                        <select id="emp-marital" value={values.maritalStatus ?? ""} onChange={(e) => set("maritalStatus", e.target.value)} className={selectClassName} disabled={submitting}>
                          <option value="">Select…</option>
                          {MARITAL_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </FormField>
                      <FormField label="Nationality" htmlFor="emp-nationality">
                        <input id="emp-nationality" value={values.nationality ?? ""} onChange={(e) => set("nationality", e.target.value)} className={inputClassName} placeholder="e.g. Indian" disabled={submitting} />
                      </FormField>
                      <FormField label="Blood group" htmlFor="emp-blood">
                        <select id="emp-blood" value={values.bloodGroup ?? ""} onChange={(e) => set("bloodGroup", e.target.value)} className={selectClassName} disabled={submitting}>
                          <option value="">Optional</option>
                          {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </FormField>
                      <FormField label="Personal email" htmlFor="emp-personal-email" error={fieldErrors.personalEmail}>
                        <input id="emp-personal-email" type="email" value={values.personalEmail ?? ""} onChange={(e) => set("personalEmail", e.target.value)} className={cn(inputClassName, fieldClass(Boolean(fieldErrors.personalEmail)))} placeholder="personal@email.com" disabled={submitting} />
                      </FormField>
                      <FormField label="Personal mobile" htmlFor="emp-personal-mobile" error={fieldErrors.personalMobile}>
                        <input id="emp-personal-mobile" type="tel" value={values.personalMobile ?? ""} onChange={(e) => set("personalMobile", e.target.value)} className={cn(inputClassName, fieldClass(Boolean(fieldErrors.personalMobile)))} placeholder="+91 98765 43210" disabled={submitting} />
                      </FormField>
                      <FormField label="Work email *" htmlFor="emp-email" error={fieldErrors.email}>
                        <input id="emp-email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} className={cn(inputClassName, fieldClass(Boolean(fieldErrors.email)))} placeholder="alex.morgan@company.com" disabled={submitting} />
                      </FormField>
                      <FormField label="Work phone" htmlFor="emp-phone" error={fieldErrors.phone}>
                        <input id="emp-phone" type="tel" value={values.phone ?? ""} onChange={(e) => set("phone", e.target.value)} className={cn(inputClassName, fieldClass(Boolean(fieldErrors.phone)))} placeholder="+91 98765 43210" disabled={submitting} />
                      </FormField>
                    </FieldGrid>
                  </>
                ) : null}

                {step === "employment" ? (
                  <>
                    <StepHeader title="Employment information" description="Core HR fields — type, status, role, and reporting." />
                    <FieldGrid>
                      <FormField label="Employee type *" htmlFor="emp-type" error={fieldErrors.employmentType}>
                        <select id="emp-type" value={values.employmentType} onChange={(e) => set("employmentType", e.target.value as HrmEmploymentType)} className={cn(selectClassName, fieldClass(Boolean(fieldErrors.employmentType)))} disabled={submitting}>
                          {HRM_EMPLOYMENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                      </FormField>
                      <FormField label="Employment status *" htmlFor="emp-status" error={fieldErrors.employmentStatus}>
                        <select id="emp-status" value={values.employmentStatus} onChange={(e) => set("employmentStatus", e.target.value as FormValues["employmentStatus"])} className={cn(selectClassName, fieldClass(Boolean(fieldErrors.employmentStatus)))} disabled={submitting}>
                          {HRM_EMPLOYMENT_STATUSES.filter((s) => s.id !== "on_leave" && s.id !== "inactive").map((s) => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </FormField>
                      <FormField label="Date of joining *" htmlFor="emp-joining" error={fieldErrors.joiningDate}>
                        <input id="emp-joining" type="date" value={values.joiningDate} onChange={(e) => set("joiningDate", e.target.value)} className={cn(inputClassName, fieldClass(Boolean(fieldErrors.joiningDate)))} disabled={submitting} max={new Date().toISOString().slice(0, 10)} />
                      </FormField>
                      <FormField label="Confirmation date" htmlFor="emp-confirm">
                        <input id="emp-confirm" type="date" value={values.confirmationDate ?? ""} onChange={(e) => set("confirmationDate", e.target.value)} className={inputClassName} disabled={submitting} />
                      </FormField>
                      <FormField label="Employee category" htmlFor="emp-category">
                        <input id="emp-category" value={values.employeeCategory ?? ""} onChange={(e) => set("employeeCategory", e.target.value)} className={inputClassName} placeholder="e.g. Individual contributor" disabled={submitting} />
                      </FormField>
                      <FormField label="Designation *" htmlFor="emp-designation" error={fieldErrors.designation}>
                        <input id="emp-designation" value={values.designation} onChange={(e) => set("designation", e.target.value)} className={cn(inputClassName, fieldClass(Boolean(fieldErrors.designation)))} placeholder="e.g. Sales Executive" disabled={submitting} />
                      </FormField>
                      <FormField label="Department *" htmlFor="emp-department" error={fieldErrors.departmentId}>
                        <select id="emp-department" value={values.departmentId ?? ""} onChange={(e) => { const id = e.target.value; set("departmentId", id); const dept = departments.find((d) => d.id === id); if (dept) set("departmentName", dept.name); else if (!id) set("departmentName", ""); }} className={cn(selectClassName, fieldClass(Boolean(fieldErrors.departmentId)))} disabled={submitting}>
                          <option value="">Select department…</option>
                          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </FormField>
                      <FormField label="Or new department" htmlFor="emp-dept-name">
                        <input id="emp-dept-name" value={values.departmentName ?? ""} onChange={(e) => { set("departmentName", e.target.value); if (e.target.value) set("departmentId", ""); }} className={inputClassName} placeholder="e.g. Revenue" disabled={submitting || Boolean(values.departmentId)} />
                      </FormField>
                      <FormField label="Reporting manager" htmlFor="emp-manager">
                        <select id="emp-manager" value={values.managerId ?? ""} onChange={(e) => set("managerId", e.target.value)} className={selectClassName} disabled={submitting}>
                          <option value="">No manager (top level)</option>
                          {managers.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.designation}</option>)}
                        </select>
                      </FormField>
                      <FormField label="Team lead" htmlFor="emp-team-lead">
                        <input id="emp-team-lead" value={values.teamLead ?? ""} onChange={(e) => set("teamLead", e.target.value)} className={inputClassName} disabled={submitting} />
                      </FormField>
                      <FormField label="Work location" htmlFor="emp-location" error={fieldErrors.location}>
                        <input id="emp-location" list="emp-locations" value={values.location ?? ""} onChange={(e) => set("location", e.target.value)} className={cn(inputClassName, fieldClass(Boolean(fieldErrors.location)))} placeholder="e.g. Mumbai, IN" disabled={submitting} />
                        <datalist id="emp-locations">{locations.map((l) => <option key={l} value={l} />)}</datalist>
                      </FormField>
                      <FormField label="Office branch" htmlFor="emp-branch">
                        <input id="emp-branch" value={values.officeBranch ?? ""} onChange={(e) => set("officeBranch", e.target.value)} className={inputClassName} disabled={submitting} />
                      </FormField>
                      <FormField label="Cost center" htmlFor="emp-cost">
                        <input id="emp-cost" value={values.costCenter ?? ""} onChange={(e) => set("costCenter", e.target.value)} className={inputClassName} disabled={submitting} />
                      </FormField>
                      <FormField label="Grade / band" htmlFor="emp-grade">
                        <input id="emp-grade" value={values.gradeBand ?? ""} onChange={(e) => set("gradeBand", e.target.value)} className={inputClassName} disabled={submitting} />
                      </FormField>
                      <FormField label="Shift assignment" htmlFor="emp-shift">
                        <input id="emp-shift" value={values.shiftAssignment ?? ""} onChange={(e) => set("shiftAssignment", e.target.value)} className={inputClassName} placeholder="General · 09:30–18:30" disabled={submitting} />
                      </FormField>
                      <FormField label="Work mode *" htmlFor="emp-work-mode" error={fieldErrors.workMode}>
                        <select id="emp-work-mode" value={values.workMode} onChange={(e) => set("workMode", e.target.value as HrmWorkMode)} className={cn(selectClassName, fieldClass(Boolean(fieldErrors.workMode)))} disabled={submitting}>
                          {HRM_WORK_MODES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                        </select>
                      </FormField>
                      <FormField label="HR role" htmlFor="emp-hr-role">
                        <select id="emp-hr-role" value={values.hrRoleId ?? ""} onChange={(e) => set("hrRoleId", e.target.value)} className={selectClassName} disabled={submitting}>
                          <option value="">No custom role</option>
                          {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      </FormField>
                    </FieldGrid>
                  </>
                ) : null}

                {step === "organization" ? (
                  <>
                    <StepHeader title="Organization hierarchy" description="Business unit, team, and reporting lines." />
                    <FieldGrid>
                      <FormField label="Business unit" htmlFor="emp-bu">
                        <input id="emp-bu" value={values.businessUnit ?? ""} onChange={(e) => set("businessUnit", e.target.value)} className={inputClassName} disabled={submitting} />
                      </FormField>
                      <FormField label="Division" htmlFor="emp-division">
                        <input id="emp-division" value={values.division ?? ""} onChange={(e) => set("division", e.target.value)} className={inputClassName} disabled={submitting} />
                      </FormField>
                      <FormField label="Team" htmlFor="emp-team">
                        <input id="emp-team" value={values.team ?? ""} onChange={(e) => set("team", e.target.value)} className={inputClassName} disabled={submitting} />
                      </FormField>
                      <FormField label="Skip-level manager" htmlFor="emp-skip">
                        <input id="emp-skip" value={values.skipLevelManager ?? ""} onChange={(e) => set("skipLevelManager", e.target.value)} className={inputClassName} disabled={submitting} />
                      </FormField>
                      <FormField label="HR manager" htmlFor="emp-hr-mgr">
                        <input id="emp-hr-mgr" value={values.hrManager ?? ""} onChange={(e) => set("hrManager", e.target.value)} className={inputClassName} disabled={submitting} />
                      </FormField>
                    </FieldGrid>
                  </>
                ) : null}

                {step === "contact" ? (
                  <>
                    <StepHeader title="Contact information" description="Address and emergency contact (optional — can fill later on profile)." />
                    <FieldGrid>
                      <FormField label="Address line 1" htmlFor="emp-addr1">
                        <input id="emp-addr1" value={values.addressLine1 ?? ""} onChange={(e) => set("addressLine1", e.target.value)} className={inputClassName} disabled={submitting} />
                      </FormField>
                      <FormField label="Address line 2" htmlFor="emp-addr2">
                        <input id="emp-addr2" value={values.addressLine2 ?? ""} onChange={(e) => set("addressLine2", e.target.value)} className={inputClassName} disabled={submitting} />
                      </FormField>
                      <FormField label="City" htmlFor="emp-city">
                        <input id="emp-city" value={values.city ?? ""} onChange={(e) => set("city", e.target.value)} className={inputClassName} disabled={submitting} />
                      </FormField>
                      <FormField label="State" htmlFor="emp-state">
                        <input id="emp-state" value={values.state ?? ""} onChange={(e) => set("state", e.target.value)} className={inputClassName} disabled={submitting} />
                      </FormField>
                      <FormField label="Country" htmlFor="emp-country">
                        <input id="emp-country" value={values.country ?? ""} onChange={(e) => set("country", e.target.value)} className={inputClassName} disabled={submitting} />
                      </FormField>
                      <FormField label="Postal code" htmlFor="emp-postal">
                        <input id="emp-postal" value={values.postalCode ?? ""} onChange={(e) => set("postalCode", e.target.value)} className={inputClassName} disabled={submitting} />
                      </FormField>
                    </FieldGrid>
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Emergency contact</p>
                      <FieldGrid>
                        <FormField label="Contact name" htmlFor="emp-em-name">
                          <input id="emp-em-name" value={values.emergencyName ?? ""} onChange={(e) => set("emergencyName", e.target.value)} className={inputClassName} disabled={submitting} />
                        </FormField>
                        <FormField label="Relationship" htmlFor="emp-em-rel">
                          <input id="emp-em-rel" value={values.emergencyRelationship ?? ""} onChange={(e) => set("emergencyRelationship", e.target.value)} className={inputClassName} placeholder="e.g. Spouse" disabled={submitting} />
                        </FormField>
                        <FormField label="Mobile number" htmlFor="emp-em-mobile" error={fieldErrors.emergencyMobile}>
                          <input id="emp-em-mobile" type="tel" value={values.emergencyMobile ?? ""} onChange={(e) => set("emergencyMobile", e.target.value)} className={cn(inputClassName, fieldClass(Boolean(fieldErrors.emergencyMobile)))} disabled={submitting} />
                        </FormField>
                      </FieldGrid>
                    </div>
                  </>
                ) : null}
              </motion.div>
            </AnimatePresence>

            {submitError ? (
              <div className="mx-5 mb-2 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{submitError}</p>
              </div>
            ) : null}

            {/* Footer actions */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
              <button type="button" onClick={onClose} disabled={submitting} className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800">
                Cancel
              </button>
              <div className="flex gap-2">
                {stepIndex > 0 ? (
                  <button type="button" onClick={goBack} disabled={submitting} className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                ) : null}
                {!isLastStep ? (
                  <button type="button" onClick={goNext} disabled={submitting} className="inline-flex h-10 items-center gap-1 rounded-lg bg-[#191970] px-5 text-sm font-semibold text-white transition hover:bg-[#12124a]">
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button type="submit" disabled={submitting} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#191970] px-6 text-sm font-semibold text-white transition hover:bg-[#12124a] disabled:opacity-60">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Create employee
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}

function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-0.5 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
