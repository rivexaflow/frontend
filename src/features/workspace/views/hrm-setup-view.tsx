"use client";

import type { ElementType } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  Plug,
  RefreshCw,
  RotateCcw,
  Settings,
  Shield,
  Wallet,
} from "lucide-react";

import { CrmPanel, CrmShell } from "@/features/workspace/components/crm/crm-panel";
import { HrmCompactBanner } from "@/features/workspace/components/hrm/hrm-compact-banner";
import { OrgChartStatStrip } from "@/features/workspace/components/hrm/org-chart-stat-strip";
import {
  CURRENCY_OPTIONS,
  DEFAULT_HRM_SETUP,
  HRM_SETUP_SECTIONS,
  LOCALE_OPTIONS,
  TIMEZONE_OPTIONS,
  type HrmSetupSection,
  type HrmSetupSettings,
} from "@/features/workspace/data/hrm-setup-demo";
import { HRM_DOCUMENT_TYPES } from "@/features/workspace/data/hrm-documents-demo";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import { fetchHrSettings, resetHrSettings, saveHrSettingsSection } from "@/lib/api/hrm";
import { cn } from "@/lib/utils/cn";

const SECTION_ICONS: Record<HrmSetupSection, ElementType> = {
  general: Settings,
  regional: Globe,
  leave: Calendar,
  attendance: Clock,
  payroll: Wallet,
  compliance: Shield,
  notifications: Bell,
  integrations: Plug,
};

const GROUP_LABELS: Record<"core" | "operations" | "platform", string> = {
  core: "Core",
  operations: "Operations",
  platform: "Platform",
};

const inputClass =
  "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950";

const selectClass =
  "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#191970] dark:border-slate-700 dark:bg-slate-950";

export function HrmSetupView() {
  const companyId = useHrCompanyId();
  const [section, setSection] = useState<HrmSetupSection>("general");
  const [settings, setSettings] = useState<HrmSetupSettings>(DEFAULT_HRM_SETUP);
  const [savedSection, setSavedSection] = useState<HrmSetupSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await fetchHrSettings(companyId);
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load settings.");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const patch = <K extends HrmSetupSection>(key: K, value: Partial<HrmSetupSettings[K]>) => {
    setSettings((s) => ({ ...s, [key]: { ...s[key], ...value } }));
    setSavedSection(null);
  };

  const handleSave = async () => {
    if (!companyId) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await saveHrSettingsSection(companyId, section, settings[section]);
      setSettings((s) => ({ ...s, [section]: updated[section] }));
      setSavedSection(section);
      window.setTimeout(() => setSavedSection(null), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!companyId) return;
    setResetting(true);
    setError(null);
    try {
      const data = await resetHrSettings(companyId);
      setSettings(data);
      setSavedSection(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset settings.");
    } finally {
      setResetting(false);
    }
  };

  const completionBySection = useMemo(() => {
    const s = settings;
    return {
      general: [s.general.fiscalYearStart, s.general.employeeIdPrefix, s.general.probationDays > 0].filter(Boolean).length,
      regional: [s.regional.defaultTimezone, s.regional.defaultLocale, s.regional.defaultCurrency].filter(Boolean).length,
      leave: [s.leave.annualLeaveDays > 0, s.leave.approvalRequired !== undefined].filter(Boolean).length,
      attendance: [s.attendance.salaryMonthCutoff > 0, s.attendance.graceMinutes >= 0].filter(Boolean).length,
      payroll: [s.payroll.payFrequency, s.payroll.taxRegion].filter(Boolean).length,
      compliance: [s.compliance.dataRetentionYears > 0, s.compliance.mandatoryDocumentTypes.length > 0].filter(Boolean).length,
      notifications: [s.notifications.digestFrequency].filter(Boolean).length,
      integrations: [s.integrations.payrollProvider].filter(Boolean).length,
    } satisfies Record<HrmSetupSection, number>;
  }, [settings]);

  const totalConfigured = Object.values(completionBySection).reduce((a, b) => a + b, 0);
  const groupedSections = useMemo(() => {
    const groups: Record<string, typeof HRM_SETUP_SECTIONS> = {};
    for (const item of HRM_SETUP_SECTIONS) {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    }
    return groups;
  }, []);

  const activeMeta = HRM_SETUP_SECTIONS.find((s) => s.id === section)!;
  const configuredPct = Math.round(
    (totalConfigured / (HRM_SETUP_SECTIONS.length * 3)) * 100,
  );

  return (
    <div className="pb-8">
      <CrmShell>
        <HrmCompactBanner
          title="System setup"
          subtitle="Regional defaults · payroll · leave · compliance · integrations"
          stats={[
            { label: "Sections", value: HRM_SETUP_SECTIONS.length },
            { label: "Configured", value: `${configuredPct}%`, tone: configuredPct >= 80 ? "success" : "warning" },
            { label: "Timezone", value: settings.regional.defaultTimezone.split("/")[1] ?? "—" },
            { label: "Currency", value: settings.regional.defaultCurrency },
          ]}
          actions={
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/15 px-3 text-xs font-semibold text-white ring-1 ring-white/20 hover:bg-white/25 disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              Reload
            </button>
          }
        />

        <div className="space-y-4 p-3 md:p-4">
          {error ? (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          <OrgChartStatStrip
            stats={[
              {
                label: "Pay frequency",
                value: settings.payroll.payFrequency,
                hint: "Payroll cycle",
                icon: Wallet,
                tone: "blue",
              },
              {
                label: "Annual leave",
                value: `${settings.leave.annualLeaveDays}d`,
                hint: "Default entitlement",
                icon: Calendar,
                tone: "emerald",
              },
              {
                label: "Audit log",
                value: settings.compliance.auditLogEnabled ? "On" : "Off",
                hint: "Compliance",
                icon: Shield,
                tone: "amber",
              },
            ]}
          />

          <CrmPanel>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading settings…
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row">
          <nav className="shrink-0 border-b border-slate-200/90 p-4 lg:w-64 lg:border-b-0 lg:border-r dark:border-slate-800">
            {(["core", "operations", "platform"] as const).map((group) => (
              <div key={group} className="mb-4 last:mb-0">
                <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {GROUP_LABELS[group]}
                </p>
                <ul className="space-y-1">
                  {groupedSections[group]?.map((item) => {
                    const Icon = SECTION_ICONS[item.id];
                    const done = completionBySection[item.id];
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => setSection(item.id)}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition",
                            section === item.id
                              ? "bg-[#191970] text-white"
                              : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0 opacity-80" />
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                              section === item.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500",
                            )}
                          >
                            {done}/3
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="min-w-0 flex-1 p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{activeMeta.label}</h2>
                <p className="mt-1 text-sm text-slate-500">{activeMeta.description}</p>
              </div>
              <span className="rounded-lg border border-slate-200/90 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-800">
                {GROUP_LABELS[activeMeta.group]} settings
              </span>
            </div>

            {section === "general" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Fiscal year starts" value={settings.general.fiscalYearStart} onChange={(v) => patch("general", { fiscalYearStart: v })} />
                <Field label="Work week (days)" type="number" value={String(settings.general.workWeekDays)} onChange={(v) => patch("general", { workWeekDays: Number(v) })} />
                <Field label="Employee ID prefix" value={settings.general.employeeIdPrefix} onChange={(v) => patch("general", { employeeIdPrefix: v })} />
                <Field label="Probation period (days)" type="number" value={String(settings.general.probationDays)} onChange={(v) => patch("general", { probationDays: Number(v) })} />
                <Field label="Notice period (days)" type="number" value={String(settings.general.noticePeriodDays)} onChange={(v) => patch("general", { noticePeriodDays: Number(v) })} />
                <Toggle label="Auto-generate employee codes" checked={settings.general.autoGenerateEmployeeCode} onChange={(v) => patch("general", { autoGenerateEmployeeCode: v })} />
              </div>
            ) : null}

            {section === "regional" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label="Default timezone" value={settings.regional.defaultTimezone} onChange={(v) => patch("regional", { defaultTimezone: v })} options={TIMEZONE_OPTIONS.map((tz) => ({ value: tz, label: tz.replace(/_/g, " ") }))} />
                <SelectField label="Default locale" value={settings.regional.defaultLocale} onChange={(v) => patch("regional", { defaultLocale: v })} options={LOCALE_OPTIONS.map((l) => ({ value: l.id, label: l.label }))} />
                <SelectField label="Default currency" value={settings.regional.defaultCurrency} onChange={(v) => patch("regional", { defaultCurrency: v })} options={CURRENCY_OPTIONS.map((c) => ({ value: c, label: c }))} />
                <Field label="Date format" value={settings.regional.dateFormat} onChange={(v) => patch("regional", { dateFormat: v })} hint="e.g. DD MMM YYYY" />
                <SelectField
                  label="Week starts on"
                  value={settings.regional.weekStartsOn}
                  onChange={(v) => patch("regional", { weekStartsOn: v as "monday" | "sunday" })}
                  options={[
                    { value: "monday", label: "Monday" },
                    { value: "sunday", label: "Sunday" },
                  ]}
                />
                <MultiCountryField
                  label="Supported countries (ISO)"
                  selected={settings.regional.supportedCountries}
                  onChange={(v) => patch("regional", { supportedCountries: v })}
                />
              </div>
            ) : null}

            {section === "leave" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Annual leave days" type="number" value={String(settings.leave.annualLeaveDays)} onChange={(v) => patch("leave", { annualLeaveDays: Number(v) })} />
                <Field label="Sick leave days" type="number" value={String(settings.leave.sickLeaveDays)} onChange={(v) => patch("leave", { sickLeaveDays: Number(v) })} />
                <Field label="Max carry-forward" type="number" value={String(settings.leave.carryForwardMax)} onChange={(v) => patch("leave", { carryForwardMax: Number(v) })} />
                <Field label="Max consecutive days" type="number" value={String(settings.leave.maxConsecutiveDays)} onChange={(v) => patch("leave", { maxConsecutiveDays: Number(v) })} />
                <Toggle label="Manager approval required" checked={settings.leave.approvalRequired} onChange={(v) => patch("leave", { approvalRequired: v })} />
                <Toggle label="Half-day leave allowed" checked={settings.leave.halfDayAllowed} onChange={(v) => patch("leave", { halfDayAllowed: v })} />
                <Toggle label="Sandwich rule (weekends between leave)" checked={settings.leave.sandwichRuleEnabled} onChange={(v) => patch("leave", { sandwichRuleEnabled: v })} />
              </div>
            ) : null}

            {section === "attendance" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Salary month cutoff (day)" type="number" value={String(settings.attendance.salaryMonthCutoff)} onChange={(v) => patch("attendance", { salaryMonthCutoff: Number(v) })} hint="e.g. 27 = 27th to 26th cycle" />
                <Field label="Late grace (minutes)" type="number" value={String(settings.attendance.graceMinutes)} onChange={(v) => patch("attendance", { graceMinutes: Number(v) })} />
                <Field label="Max remote days / month" type="number" value={String(settings.attendance.maxRemoteDaysPerMonth)} onChange={(v) => patch("attendance", { maxRemoteDaysPerMonth: Number(v) })} />
                <Toggle label="Auto-mark absent after cutoff" checked={settings.attendance.autoMarkAbsent} onChange={(v) => patch("attendance", { autoMarkAbsent: v })} />
                <Toggle label="Remote check-in allowed" checked={settings.attendance.remoteCheckInAllowed} onChange={(v) => patch("attendance", { remoteCheckInAllowed: v })} />
                <Toggle label="Overtime tracking" checked={settings.attendance.overtimeEnabled} onChange={(v) => patch("attendance", { overtimeEnabled: v })} />
                <Toggle label="Geo-fence required on-site" checked={settings.attendance.geoFenceRequired} onChange={(v) => patch("attendance", { geoFenceRequired: v })} />
              </div>
            ) : null}

            {section === "payroll" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Pay frequency"
                  value={settings.payroll.payFrequency}
                  onChange={(v) => patch("payroll", { payFrequency: v as HrmSetupSettings["payroll"]["payFrequency"] })}
                  options={[
                    { value: "monthly", label: "Monthly" },
                    { value: "biweekly", label: "Bi-weekly" },
                    { value: "weekly", label: "Weekly" },
                  ]}
                />
                <Field label="Pay day (of month / cycle)" type="number" value={String(settings.payroll.payDay)} onChange={(v) => patch("payroll", { payDay: Number(v) })} />
                <SelectField
                  label="Tax region"
                  value={settings.payroll.taxRegion}
                  onChange={(v) => patch("payroll", { taxRegion: v })}
                  options={[
                    { value: "IN", label: "India" },
                    { value: "GB", label: "United Kingdom" },
                    { value: "US", label: "United States" },
                    { value: "SG", label: "Singapore" },
                    { value: "AE", label: "UAE" },
                  ]}
                />
                <Toggle label="Provident fund (PF)" checked={settings.payroll.pfEnabled} onChange={(v) => patch("payroll", { pfEnabled: v })} />
                <Toggle label="ESI / social insurance" checked={settings.payroll.esiEnabled} onChange={(v) => patch("payroll", { esiEnabled: v })} />
                <Toggle label="Pro-rata salary on join date" checked={settings.payroll.proRataOnJoin} onChange={(v) => patch("payroll", { proRataOnJoin: v })} />
              </div>
            ) : null}

            {section === "compliance" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Data retention (years)" type="number" value={String(settings.compliance.dataRetentionYears)} onChange={(v) => patch("compliance", { dataRetentionYears: Number(v) })} />
                <Field label="POSH IC contact email" type="email" value={settings.compliance.poshIcEmail} onChange={(v) => patch("compliance", { poshIcEmail: v })} />
                <Toggle label="GDPR / data subject rights mode" checked={settings.compliance.gdprMode} onChange={(v) => patch("compliance", { gdprMode: v })} />
                <Toggle label="Immutable audit log" checked={settings.compliance.auditLogEnabled} onChange={(v) => patch("compliance", { auditLogEnabled: v })} />
                <MandatoryDocsField
                  selected={settings.compliance.mandatoryDocumentTypes}
                  onChange={(v) => patch("compliance", { mandatoryDocumentTypes: v })}
                />
              </div>
            ) : null}

            {section === "notifications" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Toggle label="Leave approval emails" checked={settings.notifications.leaveApprovalEmail} onChange={(v) => patch("notifications", { leaveApprovalEmail: v })} />
                <Toggle label="Payroll run notifications" checked={settings.notifications.payrollRunEmail} onChange={(v) => patch("notifications", { payrollRunEmail: v })} />
                <Toggle label="Policy publish alerts" checked={settings.notifications.policyPublishEmail} onChange={(v) => patch("notifications", { policyPublishEmail: v })} />
                <Toggle label="Document expiry reminders" checked={settings.notifications.documentExpiryEmail} onChange={(v) => patch("notifications", { documentExpiryEmail: v })} />
                <Field label="Event reminder (hours before)" type="number" value={String(settings.notifications.eventReminderHours)} onChange={(v) => patch("notifications", { eventReminderHours: Number(v) })} />
                <SelectField
                  label="Email digest frequency"
                  value={settings.notifications.digestFrequency}
                  onChange={(v) => patch("notifications", { digestFrequency: v as HrmSetupSettings["notifications"]["digestFrequency"] })}
                  options={[
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                    { value: "none", label: "None" },
                  ]}
                />
              </div>
            ) : null}

            {section === "integrations" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Payroll provider" value={settings.integrations.payrollProvider} onChange={(v) => patch("integrations", { payrollProvider: v })} />
                <Field label="Webhook URL" value={settings.integrations.webhookUrl} onChange={(v) => patch("integrations", { webhookUrl: v })} placeholder="https://…" />
                <Toggle label="Biometric attendance" checked={settings.integrations.biometricEnabled} onChange={(v) => patch("integrations", { biometricEnabled: v })} />
                <Toggle label="Slack notifications" checked={settings.integrations.slackNotifications} onChange={(v) => patch("integrations", { slackNotifications: v })} />
                <Toggle label="Google Calendar sync" checked={settings.integrations.googleCalendarSync} onChange={(v) => patch("integrations", { googleCalendarSync: v })} />
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="h-10 rounded-lg bg-[#191970] px-5 text-sm font-semibold text-white hover:bg-[#12124a] disabled:opacity-50"
              >
                {saving ? "Saving…" : `Save ${activeMeta.label.toLowerCase()}`}
              </button>
              <button
                type="button"
                onClick={() => void handleReset()}
                disabled={resetting}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <RotateCcw className={`h-4 w-4 ${resetting ? "animate-spin" : ""}`} />
                {resetting ? "Resetting…" : "Reset all to defaults"}
              </button>
              <button
                type="button"
                onClick={() => void load()}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" /> Reload
              </button>
              {savedSection === section ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Section saved
                </span>
              ) : null}
            </div>
          </div>
        </div>
            )}
          </CrmPanel>
        </div>
      </CrmShell>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, "mt-1.5")} />
      {hint ? <span className="mt-1 block text-[11px] text-slate-400">{hint}</span> : null}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(selectClass, "mt-1.5")}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200/90 px-4 py-3 dark:border-slate-800">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition", checked ? "bg-[#191970]" : "bg-slate-200 dark:bg-slate-700")}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition", checked ? "left-[22px]" : "left-0.5")} />
      </button>
    </label>
  );
}

const COUNTRY_OPTIONS = ["IN", "SG", "GB", "US", "AE", "DE", "AU"];

function MultiCountryField({ label, selected, onChange }: { label: string; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (code: string) => {
    onChange(selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code]);
  };
  return (
    <div className="sm:col-span-2">
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</span>
      <div className="mt-2 flex flex-wrap gap-2">
        {COUNTRY_OPTIONS.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => toggle(code)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
              selected.includes(code)
                ? "border-[#191970] bg-[#191970]/10 text-[#191970]"
                : "border-slate-200 text-slate-500 hover:border-slate-300",
            )}
          >
            {code}
          </button>
        ))}
      </div>
    </div>
  );
}

function MandatoryDocsField({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((d) => d !== id) : [...selected, id]);
  };
  return (
    <div className="sm:col-span-2">
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Mandatory document types</span>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {HRM_DOCUMENT_TYPES.map((doc) => (
          <label key={doc.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200/90 px-4 py-3 dark:border-slate-800">
            <input type="checkbox" checked={selected.includes(doc.id)} onChange={() => toggle(doc.id)} className="h-4 w-4 rounded border-slate-300 text-[#191970]" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{doc.title}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
