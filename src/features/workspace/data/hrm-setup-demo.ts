import type { HrmSetupSection, HrmSetupSettings } from "@/types/hrm";
import { DEFAULT_PAYROLL_SALARY_COMPONENTS } from "@/features/workspace/data/hrm-payroll-salary-components";

export type { HrmSetupSection, HrmSetupSettings } from "@/types/hrm";

export const DEFAULT_HRM_SETUP: HrmSetupSettings = {
  general: {
    fiscalYearStart: "April",
    workWeekDays: 5,
    employeeIdPrefix: "EMP",
    probationDays: 90,
    noticePeriodDays: 30,
    autoGenerateEmployeeCode: true,
  },
  regional: {
    defaultTimezone: "Asia/Kolkata",
    defaultLocale: "en-IN",
    dateFormat: "DD MMM YYYY",
    weekStartsOn: "monday",
    defaultCurrency: "INR",
    supportedCountries: ["IN", "SG", "GB", "US"],
  },
  leave: {
    annualLeaveDays: 18,
    sickLeaveDays: 12,
    carryForwardMax: 5,
    approvalRequired: true,
    halfDayAllowed: true,
    sandwichRuleEnabled: false,
    maxConsecutiveDays: 15,
  },
  attendance: {
    salaryMonthCutoff: 27,
    graceMinutes: 15,
    autoMarkAbsent: true,
    remoteCheckInAllowed: true,
    overtimeEnabled: false,
    geoFenceRequired: false,
    maxRemoteDaysPerMonth: 10,
  },
  payroll: {
    payFrequency: "monthly",
    payDay: 1,
    taxRegion: "IN",
    pfEnabled: true,
    esiEnabled: true,
    proRataOnJoin: true,
    salaryComponents: DEFAULT_PAYROLL_SALARY_COMPONENTS,
  },
  compliance: {
    dataRetentionYears: 7,
    gdprMode: false,
    auditLogEnabled: true,
    mandatoryDocumentTypes: ["doc_type_aadhaar", "doc_type_pan", "doc_type_contract"],
    poshIcEmail: "posh-ic@acme.com",
  },
  notifications: {
    leaveApprovalEmail: true,
    payrollRunEmail: true,
    policyPublishEmail: true,
    documentExpiryEmail: true,
    eventReminderHours: 24,
    digestFrequency: "weekly",
  },
  integrations: {
    payrollProvider: "Rivexa Payroll",
    biometricEnabled: false,
    slackNotifications: true,
    googleCalendarSync: false,
    webhookUrl: "",
  },
};

export const HRM_SETUP_SECTIONS: {
  id: HrmSetupSection;
  label: string;
  description: string;
  group: "core" | "operations" | "platform";
}[] = [
  { id: "general", label: "General", description: "Fiscal year, IDs, and employment defaults", group: "core" },
  { id: "regional", label: "Regional & locale", description: "Timezone, currency, and international formats", group: "core" },
  { id: "leave", label: "Leave rules", description: "Accrual, carry-forward, and approval policy", group: "operations" },
  { id: "attendance", label: "Attendance", description: "Salary month, grace period, and check-in rules", group: "operations" },
  { id: "payroll", label: "Payroll", description: "Pay cycle, statutory deductions, and tax region", group: "operations" },
  { id: "compliance", label: "Compliance", description: "Retention, audit logs, and mandatory documents", group: "core" },
  { id: "notifications", label: "Notifications", description: "Email alerts, digests, and reminder timing", group: "platform" },
  { id: "integrations", label: "Integrations", description: "Payroll, biometric, webhooks, and calendar sync", group: "platform" },
];

export const TIMEZONE_OPTIONS = [
  "Asia/Kolkata",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/Berlin",
  "Australia/Sydney",
];

export const LOCALE_OPTIONS = [
  { id: "en-IN", label: "English (India)" },
  { id: "en-GB", label: "English (UK)" },
  { id: "en-US", label: "English (US)" },
  { id: "en-SG", label: "English (Singapore)" },
];

export const CURRENCY_OPTIONS = ["INR", "USD", "GBP", "EUR", "SGD", "AED"];
