"use client";

import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
} from "lucide-react";

import {
  AnimatedSection,
  FormField,
  FormSectionBlock,
  FormSelect,
  FormTextArea,
  FormToggle,
  FormUploadPlaceholder,
  InfoChip,
} from "@/features/workspace/components/hrm/employees/profile/employee-profile-form-primitives";
import {
  ProfileDataTable,
} from "@/features/workspace/components/hrm/employees/profile/employee-profile-shell";
import { EmployeeStatusBadge } from "@/features/workspace/components/hrm/employees/employee-status-badge";
import {
  getManagerName,
  HRM_EMPLOYMENT_STATUSES,
  HRM_EMPLOYMENT_TYPES,
  HRM_WORK_MODES,
} from "@/features/workspace/data/hrm-employees-demo";
import { workspacePaths } from "@/lib/workspace/paths";
import type { HrmEmployeeProfile, HrmEmployeeProfileSectionId, HrmEmployeeRecord } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

const MARITAL_OPTIONS = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Divorced", label: "Divorced" },
  { value: "Widowed", label: "Widowed" },
];

type Props = {
  profile: HrmEmployeeProfile;
  section: HrmEmployeeProfileSectionId;
  allEmployees: HrmEmployeeRecord[];
  onChange: (patch: Partial<HrmEmployeeProfile>) => void;
};

export function EmployeeProfileSectionContent({ profile, section, allEmployees, onChange }: Props) {
  const manager = getManagerName(allEmployees, profile.managerId);

  const patchBasic = (patch: Partial<HrmEmployeeProfile["basic"]>) =>
    onChange({ basic: { ...profile.basic, ...patch } });
  const patchEmployment = (patch: Partial<HrmEmployeeProfile["employmentDetails"]>) =>
    onChange({ employmentDetails: { ...profile.employmentDetails, ...patch } });
  const patchOrg = (patch: Partial<HrmEmployeeProfile["organization"]>) =>
    onChange({ organization: { ...profile.organization, ...patch } });
  const patchContact = (patch: Partial<HrmEmployeeProfile["contact"]>) =>
    onChange({ contact: { ...profile.contact, ...patch } });
  const patchIdentity = (patch: Partial<HrmEmployeeProfile["identity"]>) =>
    onChange({ identity: { ...profile.identity, ...patch } });
  const patchPayroll = (patch: Partial<HrmEmployeeProfile["payroll"]>) =>
    onChange({ payroll: { ...profile.payroll, ...patch } });
  const patchAttendance = (patch: Partial<HrmEmployeeProfile["attendanceLeave"]>) =>
    onChange({ attendanceLeave: { ...profile.attendanceLeave, ...patch } });
  const patchAssets = (patch: Partial<HrmEmployeeProfile["assetsInfo"]>) =>
    onChange({ assetsInfo: { ...profile.assetsInfo, ...patch } });
  const patchSkills = (patch: Partial<HrmEmployeeProfile["skillsInfo"]>) =>
    onChange({ skillsInfo: { ...profile.skillsInfo, ...patch } });
  const patchPerformance = (patch: Partial<HrmEmployeeProfile["performance"]>) =>
    onChange({ performance: { ...profile.performance, ...patch } });
  const patchAccess = (patch: Partial<HrmEmployeeProfile["access"]>) =>
    onChange({ access: { ...profile.access, ...patch } });
  const patchExit = (patch: Partial<HrmEmployeeProfile["exit"]>) =>
    onChange({ exit: { ...profile.exit, ...patch } });

  return (
    <AnimatePresence mode="wait">
      <AnimatedSection sectionKey={section}>
        <div className="space-y-4 p-5">
          {section === "basic" ? (
            <>
              <FormSectionBlock title="Required fields" description="Core identity and personal contact.">
                <FormField label="Employee ID" value={profile.employeeCode} readOnly hint="Auto-generated" />
                <FormField label="First name" value={profile.basic.firstName} onChange={(v) => patchBasic({ firstName: v })} required />
                <FormField label="Middle name" value={profile.basic.middleName ?? ""} onChange={(v) => patchBasic({ middleName: v })} />
                <FormField label="Last name" value={profile.basic.lastName} onChange={(v) => patchBasic({ lastName: v })} required />
                <FormField label="Preferred name" value={profile.basic.preferredName ?? ""} onChange={(v) => patchBasic({ preferredName: v })} />
                <FormSelect label="Gender" value={profile.basic.gender ?? ""} onChange={(v) => patchBasic({ gender: v })} options={GENDER_OPTIONS} />
                <FormField label="Date of birth" value={profile.basic.dateOfBirth ?? ""} onChange={(v) => patchBasic({ dateOfBirth: v })} type="date" required />
                <FormSelect label="Marital status" value={profile.basic.maritalStatus ?? ""} onChange={(v) => patchBasic({ maritalStatus: v })} options={MARITAL_OPTIONS} />
                <FormField label="Nationality" value={profile.basic.nationality ?? ""} onChange={(v) => patchBasic({ nationality: v })} required />
                <FormField label="Blood group" value={profile.basic.bloodGroup ?? ""} onChange={(v) => patchBasic({ bloodGroup: v })} hint="Optional" />
                <FormField label="Personal email" value={profile.basic.personalEmail ?? ""} onChange={(v) => patchBasic({ personalEmail: v })} type="email" required />
                <FormField label="Personal mobile" value={profile.basic.personalMobile ?? ""} onChange={(v) => patchBasic({ personalMobile: v })} type="tel" required />
                <FormUploadPlaceholder label="Profile picture" hint="PNG or JPG · max 5 MB" />
              </FormSectionBlock>
            </>
          ) : null}

          {section === "employment" ? (
            <>
              <FormSectionBlock title="Core HR fields" description="Employment type, status, and role assignment.">
                <FormSelect
                  label="Employee type"
                  value={profile.employmentType}
                  onChange={(v) => onChange({ employmentType: v as HrmEmployeeProfile["employmentType"] })}
                  options={HRM_EMPLOYMENT_TYPES.map((t) => ({ value: t.id, label: t.label }))}
                  required
                />
                <FormSelect
                  label="Employment status"
                  value={profile.status}
                  onChange={(v) => onChange({ status: v as HrmEmployeeProfile["status"] })}
                  options={HRM_EMPLOYMENT_STATUSES.map((s) => ({ value: s.id, label: s.label }))}
                  required
                />
                <FormField label="Date of joining" value={profile.joinedAt} readOnly required />
                <FormField label="Confirmation date" value={profile.employmentDetails.confirmationDate ?? ""} onChange={(v) => patchEmployment({ confirmationDate: v })} type="date" />
                <FormField label="Employee category" value={profile.employmentDetails.employeeCategory ?? ""} onChange={(v) => patchEmployment({ employeeCategory: v })} />
                <FormField label="Designation" value={profile.designation} onChange={(v) => onChange({ designation: v })} required />
                <FormField label="Department" value={profile.department} onChange={(v) => onChange({ department: v })} required />
                <FormField label="Reporting manager" value={manager} readOnly />
                <FormField label="Team lead" value={profile.employmentDetails.teamLead ?? ""} onChange={(v) => patchEmployment({ teamLead: v })} />
                <FormField label="Work location" value={profile.employmentDetails.workLocation ?? profile.location} onChange={(v) => patchEmployment({ workLocation: v })} />
                <FormField label="Office branch" value={profile.employmentDetails.officeBranch ?? ""} onChange={(v) => patchEmployment({ officeBranch: v })} />
                <FormField label="Cost center" value={profile.employmentDetails.costCenter ?? ""} onChange={(v) => patchEmployment({ costCenter: v })} />
                <FormField label="Grade / band" value={profile.employmentDetails.gradeBand ?? ""} onChange={(v) => patchEmployment({ gradeBand: v })} />
                <FormField label="Shift assignment" value={profile.employmentDetails.shiftAssignment ?? ""} onChange={(v) => patchEmployment({ shiftAssignment: v })} />
                <div className="sm:col-span-2 lg:col-span-3">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">Current status</span>
                  <EmployeeStatusBadge status={profile.status} />
                </div>
              </FormSectionBlock>
            </>
          ) : null}

          {section === "organization" ? (
            <FormSectionBlock title="Organization hierarchy" description="Business structure and reporting lines.">
              <FormField label="Business unit" value={profile.organization.businessUnit ?? ""} onChange={(v) => patchOrg({ businessUnit: v })} />
              <FormField label="Division" value={profile.organization.division ?? ""} onChange={(v) => patchOrg({ division: v })} />
              <FormField label="Department" value={profile.organization.department} onChange={(v) => patchOrg({ department: v })} required />
              <FormField label="Team" value={profile.organization.team ?? ""} onChange={(v) => patchOrg({ team: v })} />
              <FormField label="Reporting manager" value={profile.organization.reportingManager ?? manager} onChange={(v) => patchOrg({ reportingManager: v })} />
              <FormField label="Skip-level manager" value={profile.organization.skipLevelManager ?? ""} onChange={(v) => patchOrg({ skipLevelManager: v })} />
              <FormField label="HR manager" value={profile.organization.hrManager ?? ""} onChange={(v) => patchOrg({ hrManager: v })} />
            </FormSectionBlock>
          ) : null}

          {section === "contact" ? (
            <>
              <FormSectionBlock title="Current address" description="Primary residential address.">
                <FormField label="Address line 1" value={profile.contact.addressLine1 ?? ""} onChange={(v) => patchContact({ addressLine1: v })} span={3} />
                <FormField label="Address line 2" value={profile.contact.addressLine2 ?? ""} onChange={(v) => patchContact({ addressLine2: v })} span={3} />
                <FormField label="City" value={profile.contact.city ?? ""} onChange={(v) => patchContact({ city: v })} />
                <FormField label="State" value={profile.contact.state ?? ""} onChange={(v) => patchContact({ state: v })} />
                <FormField label="Country" value={profile.contact.country ?? ""} onChange={(v) => patchContact({ country: v })} />
                <FormField label="Postal code" value={profile.contact.postalCode ?? ""} onChange={(v) => patchContact({ postalCode: v })} />
                <FormField label="Work email" value={profile.email} onChange={(v) => onChange({ email: v })} />
                <FormField label="Work phone" value={profile.phone ?? ""} onChange={(v) => onChange({ phone: v })} />
              </FormSectionBlock>

              <FormSectionBlock title="Permanent address" description="Legal or permanent residence.">
                <FormToggle
                  label="Same as current address"
                  checked={profile.contact.permanentSameAsCurrent ?? false}
                  onChange={(v) => patchContact({ permanentSameAsCurrent: v })}
                  description="Copy current address to permanent address fields."
                />
                {!profile.contact.permanentSameAsCurrent ? (
                  <>
                    <FormField label="Address line 1" value={profile.contact.permanentAddressLine1 ?? ""} onChange={(v) => patchContact({ permanentAddressLine1: v })} span={3} />
                    <FormField label="City" value={profile.contact.permanentCity ?? ""} onChange={(v) => patchContact({ permanentCity: v })} />
                    <FormField label="State" value={profile.contact.permanentState ?? ""} onChange={(v) => patchContact({ permanentState: v })} />
                    <FormField label="Country" value={profile.contact.permanentCountry ?? ""} onChange={(v) => patchContact({ permanentCountry: v })} />
                    <FormField label="Postal code" value={profile.contact.permanentPostalCode ?? ""} onChange={(v) => patchContact({ permanentPostalCode: v })} />
                  </>
                ) : null}
              </FormSectionBlock>

              <FormSectionBlock title="Emergency contact">
                <FormField label="Contact name" value={profile.contact.emergencyName ?? ""} onChange={(v) => patchContact({ emergencyName: v })} required />
                <FormField label="Relationship" value={profile.contact.emergencyRelationship ?? ""} onChange={(v) => patchContact({ emergencyRelationship: v })} />
                <FormField label="Mobile number" value={profile.contact.emergencyMobile ?? ""} onChange={(v) => patchContact({ emergencyMobile: v })} type="tel" required />
                <FormField label="Alternate number" value={profile.contact.emergencyAlternate ?? ""} onChange={(v) => patchContact({ emergencyAlternate: v })} type="tel" />
              </FormSectionBlock>
            </>
          ) : null}

          {section === "identity" ? (
            <>
              <FormSectionBlock
                title={profile.identity.region === "india" ? "India — government IDs" : "International — identity"}
                description="Configurable per country. Switch region in HR setup."
              >
                <FormSelect
                  label="Region"
                  value={profile.identity.region}
                  onChange={(v) => patchIdentity({ region: v as "india" | "international" })}
                  options={[
                    { value: "india", label: "India" },
                    { value: "international", label: "International" },
                  ]}
                />
                {profile.identity.region === "india" ? (
                  <>
                    <FormField label="PAN number" value={profile.identity.panNumber ?? ""} onChange={(v) => patchIdentity({ panNumber: v })} />
                    <FormField label="Aadhaar number" value={profile.identity.aadhaarNumber ?? ""} onChange={(v) => patchIdentity({ aadhaarNumber: v })} />
                    <FormField label="Passport number" value={profile.identity.passportNumber ?? ""} onChange={(v) => patchIdentity({ passportNumber: v })} />
                    <FormField label="Driving license" value={profile.identity.drivingLicense ?? ""} onChange={(v) => patchIdentity({ drivingLicense: v })} />
                    <FormField label="UAN" value={profile.identity.uan ?? ""} onChange={(v) => patchIdentity({ uan: v })} />
                    <FormField label="ESIC number" value={profile.identity.esicNumber ?? ""} onChange={(v) => patchIdentity({ esicNumber: v })} />
                  </>
                ) : (
                  <>
                    <FormField label="Social security number" value={profile.identity.socialSecurityNumber ?? ""} onChange={(v) => patchIdentity({ socialSecurityNumber: v })} />
                    <FormField label="Tax ID" value={profile.identity.taxId ?? ""} onChange={(v) => patchIdentity({ taxId: v })} />
                    <FormField label="Passport number" value={profile.identity.passportNumber ?? ""} onChange={(v) => patchIdentity({ passportNumber: v })} />
                    <FormField label="Visa number" value={profile.identity.visaNumber ?? ""} onChange={(v) => patchIdentity({ visaNumber: v })} />
                    <FormField label="Work permit number" value={profile.identity.workPermitNumber ?? ""} onChange={(v) => patchIdentity({ workPermitNumber: v })} />
                  </>
                )}
              </FormSectionBlock>
            </>
          ) : null}

          {section === "payroll" ? (
            <>
              <FormSectionBlock title="Salary structure" description="Compensation breakdown and payment details.">
                <FormField label="CTC (annual)" value={profile.payroll.ctc != null ? String(profile.payroll.ctc) : ""} onChange={(v) => patchPayroll({ ctc: Number(v) || 0 })} type="number" />
                <FormField label="Basic salary" value={profile.payroll.basicSalary != null ? String(profile.payroll.basicSalary) : ""} onChange={(v) => patchPayroll({ basicSalary: Number(v) || 0 })} type="number" />
                <FormField label="Allowances" value={profile.payroll.allowances != null ? String(profile.payroll.allowances) : ""} onChange={(v) => patchPayroll({ allowances: Number(v) || 0 })} type="number" />
                <FormField label="Bank name" value={profile.payroll.bankName ?? ""} onChange={(v) => patchPayroll({ bankName: v })} />
                <FormField label="Account number" value={profile.payroll.accountNumber ?? ""} onChange={(v) => patchPayroll({ accountNumber: v })} />
                <FormField label="IFSC / SWIFT code" value={profile.payroll.ifscSwift ?? ""} onChange={(v) => patchPayroll({ ifscSwift: v })} />
                <FormSelect
                  label="Payment method"
                  value={profile.payroll.paymentMethod ?? ""}
                  onChange={(v) => patchPayroll({ paymentMethod: v })}
                  options={[
                    { value: "Bank transfer", label: "Bank transfer" },
                    { value: "Cheque", label: "Cheque" },
                    { value: "Cash", label: "Cash" },
                  ]}
                />
                <FormSelect
                  label="Tax regime"
                  value={profile.payroll.taxRegime ?? ""}
                  onChange={(v) => patchPayroll({ taxRegime: v })}
                  options={[
                    { value: "New regime", label: "New regime" },
                    { value: "Old regime", label: "Old regime" },
                    { value: "Standard", label: "Standard" },
                  ]}
                />
                <FormField label="Currency" value={profile.payroll.currency ?? ""} onChange={(v) => patchPayroll({ currency: v })} />
                <FormField label="Last paid period" value={profile.payroll.lastPaidPeriod ?? ""} readOnly />
              </FormSectionBlock>
              <div className="px-5 pb-2">
                <Link href={workspacePaths.hrmPayroll} className="text-sm font-semibold text-[#191970] hover:underline">
                  View full payroll history →
                </Link>
              </div>
            </>
          ) : null}

          {section === "attendance_leave" ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoChip label="Annual leave" value={`${profile.attendanceLeave.annualBalance ?? 0} days`} tone="success" />
                <InfoChip label="Sick leave" value={`${profile.attendanceLeave.sickBalance ?? 0} days`} />
                <InfoChip label="Pending requests" value={String(profile.attendanceLeave.pendingRequests ?? 0)} tone="warning" />
                <InfoChip label="Attendance rate" value={`${profile.attendanceLeave.attendanceRate ?? "—"}%`} />
              </div>
              <FormSectionBlock title="Policies & schedule">
                <FormField label="Shift" value={profile.attendanceLeave.shift ?? ""} onChange={(v) => patchAttendance({ shift: v })} />
                <FormField label="Weekly off" value={profile.attendanceLeave.weeklyOff ?? ""} onChange={(v) => patchAttendance({ weeklyOff: v })} />
                <FormField label="Attendance policy" value={profile.attendanceLeave.attendancePolicy ?? ""} onChange={(v) => patchAttendance({ attendancePolicy: v })} />
                <FormField label="Leave policy" value={profile.attendanceLeave.leavePolicy ?? ""} onChange={(v) => patchAttendance({ leavePolicy: v })} />
                <FormSelect
                  label="Work mode"
                  value={profile.attendanceLeave.workMode ?? profile.workMode ?? "onsite"}
                  onChange={(v) => {
                    patchAttendance({ workMode: v as HrmEmployeeProfile["workMode"] });
                    onChange({ workMode: v as HrmEmployeeProfile["workMode"] });
                  }}
                  options={HRM_WORK_MODES.map((m) => ({ value: m.id, label: m.label }))}
                />
                <FormField label="Working hours" value={profile.attendanceLeave.workingHours ?? ""} onChange={(v) => patchAttendance({ workingHours: v })} />
                <FormToggle
                  label="Overtime eligible"
                  checked={profile.attendanceLeave.overtimeEligible ?? false}
                  onChange={(v) => patchAttendance({ overtimeEligible: v })}
                />
              </FormSectionBlock>
              <div className="flex flex-wrap gap-3">
                <Link href={`${workspacePaths.hrmAttendance}?employee=${profile.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-[#191970] shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                  <Clock className="h-3.5 w-3.5" />
                  Open attendance profile
                </Link>
                <Link href={workspacePaths.hrmLeave} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-[#191970] shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                  <Calendar className="h-3.5 w-3.5" />
                  Leave balance dashboard
                </Link>
              </div>
            </>
          ) : null}

          {section === "assets" ? (
            <>
              <FormSectionBlock title="Assigned assets" description="Track company equipment and licenses.">
                <FormToggle label="Laptop assigned" checked={profile.assetsInfo.laptopAssigned ?? false} onChange={(v) => patchAssets({ laptopAssigned: v })} />
                <FormField label="Laptop serial number" value={profile.assetsInfo.laptopSerial ?? ""} onChange={(v) => patchAssets({ laptopSerial: v })} />
                <FormField label="Monitor" value={profile.assetsInfo.monitor ?? ""} onChange={(v) => patchAssets({ monitor: v })} />
                <FormField label="Phone" value={profile.assetsInfo.phone ?? ""} onChange={(v) => patchAssets({ phone: v })} />
                <FormField label="Access card" value={profile.assetsInfo.accessCard ?? ""} onChange={(v) => patchAssets({ accessCard: v })} />
                <FormField label="SIM card" value={profile.assetsInfo.simCard ?? ""} onChange={(v) => patchAssets({ simCard: v })} />
                <FormTextArea label="Software licenses" value={profile.assetsInfo.softwareLicenses ?? ""} onChange={(v) => patchAssets({ softwareLicenses: v })} span={3} />
              </FormSectionBlock>
              <ProfileDataTable
                columns={["Asset", "Category", "Serial", "Assigned", "Status"]}
                rows={profile.assetItems.map((a) => [a.name, a.category, a.serialNumber ?? "—", a.assignedAt, a.status])}
                emptyMessage="No additional assets in inventory log."
              />
            </>
          ) : null}

          {section === "skills" ? (
            <>
              <FormSectionBlock title="Skills & professional details">
                <FormField label="Primary skills" value={profile.skillsInfo.primarySkills ?? ""} onChange={(v) => patchSkills({ primarySkills: v })} span={3} />
                <FormField label="Secondary skills" value={profile.skillsInfo.secondarySkills ?? ""} onChange={(v) => patchSkills({ secondarySkills: v })} span={3} />
                <FormField label="Certifications" value={profile.skillsInfo.certifications ?? ""} onChange={(v) => patchSkills({ certifications: v })} span={3} />
                <FormField label="Years of experience" value={profile.skillsInfo.yearsOfExperience != null ? String(profile.skillsInfo.yearsOfExperience) : ""} onChange={(v) => patchSkills({ yearsOfExperience: Number(v) || 0 })} type="number" />
                <FormField label="Previous employer" value={profile.skillsInfo.previousEmployer ?? ""} onChange={(v) => patchSkills({ previousEmployer: v })} />
                <FormField label="LinkedIn profile" value={profile.skillsInfo.linkedIn ?? ""} onChange={(v) => patchSkills({ linkedIn: v })} />
                <FormField label="Portfolio website" value={profile.skillsInfo.portfolio ?? ""} onChange={(v) => patchSkills({ portfolio: v })} />
                <FormUploadPlaceholder label="Resume upload" hint="PDF preferred" />
              </FormSectionBlock>
              <ProfileDataTable
                columns={["Skill", "Level", "Certified", "Expiry"]}
                rows={profile.skillItems.map((s) => [s.name, s.level, s.certified ? "Yes" : "No", s.expiryDate ?? "—"])}
                emptyMessage="Add structured skill records from HR setup."
              />
            </>
          ) : null}

          {section === "documents" ? (
            <>
              <ProfileDataTable
                columns={["Document", "Type", "Status", "Uploaded"]}
                rows={profile.documents.map((d) => [
                  d.name,
                  d.type,
                  <span
                    key={d.id}
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase",
                      d.status === "verified" ? "bg-emerald-50 text-emerald-700" : d.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700",
                    )}
                  >
                    {d.status}
                  </span>,
                  d.uploadedAt,
                ])}
                emptyMessage="No documents uploaded for this employee."
              />
              <FormSectionBlock title="Upload documents" description="Resume, contracts, ID proofs, and visa files.">
                {["Resume", "Offer letter", "NDA", "Employment agreement", "Education certificates", "ID proof", "Address proof", "Passport", "Visa documents"].map((doc) => (
                  <FormUploadPlaceholder key={doc} label={doc} />
                ))}
              </FormSectionBlock>
              <div className="px-5 pb-2">
                <Link href={workspacePaths.hrmDocuments} className="text-sm font-semibold text-[#191970] hover:underline">
                  Manage in Document center →
                </Link>
              </div>
            </>
          ) : null}

          {section === "performance" ? (
            <>
              <FormSectionBlock title="Performance overview">
                <FormField label="Probation status" value={profile.performance.probationStatus ?? ""} onChange={(v) => patchPerformance({ probationStatus: v })} />
                <FormField label="Performance rating" value={profile.performance.performanceRating != null ? String(profile.performance.performanceRating) : ""} onChange={(v) => patchPerformance({ performanceRating: Number(v) || 0 })} type="number" />
                <FormTextArea label="KPIs" value={profile.performance.kpis ?? ""} onChange={(v) => patchPerformance({ kpis: v })} />
                <FormTextArea label="Goals" value={profile.performance.goals ?? ""} onChange={(v) => patchPerformance({ goals: v })} />
                <FormTextArea label="Promotion history" value={profile.performance.promotionHistory ?? ""} onChange={(v) => patchPerformance({ promotionHistory: v })} />
                <FormTextArea label="Appraisal history" value={profile.performance.appraisalHistory ?? ""} onChange={(v) => patchPerformance({ appraisalHistory: v })} />
              </FormSectionBlock>
              <div className="space-y-3">
                {profile.performance.reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-slate-200/80 p-4 dark:border-slate-800">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{r.period}</p>
                        <p className="text-xs text-slate-500">Reviewed by {r.reviewer}</p>
                      </div>
                      <span className="rounded-lg bg-[#191970]/10 px-2.5 py-1 text-sm font-bold tabular-nums text-[#191970]">
                        {r.rating.toFixed(1)} / 5
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{r.summary}</p>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {section === "access" ? (
            <FormSectionBlock title="Access control" description="Roles, permissions, and security for SaaS workspace.">
              <FormField label="User role" value={profile.access.userRole ?? profile.access.hrRoleName ?? ""} onChange={(v) => patchAccess({ userRole: v })} />
              <FormField label="Permissions" value={profile.access.permissions ?? ""} onChange={(v) => patchAccess({ permissions: v })} span={3} />
              <FormField label="Department access" value={profile.access.departmentAccess ?? ""} onChange={(v) => patchAccess({ departmentAccess: v })} />
              <FormField label="Project access" value={profile.access.projectAccess ?? ""} onChange={(v) => patchAccess({ projectAccess: v })} />
              <FormToggle label="CRM access" checked={profile.access.crmAccess ?? false} onChange={(v) => patchAccess({ crmAccess: v })} />
              <FormToggle label="Finance access" checked={profile.access.financeAccess ?? false} onChange={(v) => patchAccess({ financeAccess: v })} />
              <FormToggle label="Admin rights" checked={profile.access.adminRights ?? false} onChange={(v) => patchAccess({ adminRights: v })} />
              <FormToggle label="MFA enabled" checked={profile.access.mfaEnabled ?? false} onChange={(v) => patchAccess({ mfaEnabled: v })} />
              <FormField label="Data scope" value={profile.access.dataScope ?? "—"} readOnly />
              <FormField label="Last login" value={profile.access.lastLogin ?? "—"} readOnly />
              <div className="sm:col-span-2 lg:col-span-3">
                <Link href={workspacePaths.hrmAdmin} className="text-sm font-semibold text-[#191970] hover:underline">
                  Manage HR roles & RBAC →
                </Link>
              </div>
            </FormSectionBlock>
          ) : null}

          {section === "exit" ? (
            <FormSectionBlock title="Exit management" description="Offboarding, clearance, and full & final settlement.">
              <FormField label="Exit status" value={profile.exit.status.replace("_", " ")} readOnly />
              <FormField label="Notice period (days)" value={profile.exit.noticePeriodDays != null ? String(profile.exit.noticePeriodDays) : ""} onChange={(v) => patchExit({ noticePeriodDays: Number(v) || 0 })} type="number" />
              <FormField label="Last working day" value={profile.exit.lastWorkingDay ?? profile.leavingDate ?? "—"} onChange={(v) => patchExit({ lastWorkingDay: v })} type="date" />
              <FormField label="Exit reason" value={profile.exit.reason ?? ""} onChange={(v) => patchExit({ reason: v })} />
              <FormTextArea label="Exit interview notes" value={profile.exit.exitInterview ?? ""} onChange={(v) => patchExit({ exitInterview: v })} />
              <FormField label="Asset return status" value={profile.exit.assetReturnStatus ?? ""} onChange={(v) => patchExit({ assetReturnStatus: v })} />
              <FormField label="Full & final settlement" value={profile.exit.fullAndFinalStatus ?? ""} onChange={(v) => patchExit({ fullAndFinalStatus: v })} />
              {profile.exit.clearanceProgress != null ? (
                <div className="sm:col-span-2 lg:col-span-3">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">Clearance progress</span>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-[#191970]" style={{ width: `${profile.exit.clearanceProgress}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{profile.exit.clearanceProgress}% complete</p>
                </div>
              ) : null}
              <FormTextArea label="Exit notes" value={profile.exit.notes ?? ""} onChange={(v) => patchExit({ notes: v })} />
            </FormSectionBlock>
          ) : null}

          {section === "timeline" ? (
            <>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {profile.timeline.map((a) => (
                  <li key={a.id} className="flex gap-3 py-4">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#191970]" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.action}</p>
                      {a.detail ? <p className="text-sm text-slate-500">{a.detail}</p> : null}
                      <p className="mt-0.5 text-xs text-slate-400">
                        {a.occurredAt}
                        {a.actor ? ` · ${a.actor}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              {profile.timeline.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No activity recorded yet.</p>
              ) : null}
            </>
          ) : null}
        </div>
      </AnimatedSection>
    </AnimatePresence>
  );
}
