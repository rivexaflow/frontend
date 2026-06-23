"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { EmployeeProfileSectionContent } from "@/features/workspace/components/hrm/employees/profile/employee-profile-sections";
import { EmployeeProfileShell } from "@/features/workspace/components/hrm/employees/profile/employee-profile-shell";
import {
  LEGACY_PROFILE_SECTION_MAP,
} from "@/features/workspace/data/hrm-employee-profile-demo";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import { fetchHrEmployeeProfile } from "@/lib/api/hrm-employee-profile";
import { fetchHrEmployees, updateHrEmployee } from "@/lib/api/hrm";
import { MISSING_COMPANY_CONTEXT_MESSAGE } from "@/lib/workspace/company-context";
import type { HrmEmployeeProfile, HrmEmployeeProfileSectionId, HrmEmployeeRecord } from "@/types/hrm";

type Props = {
  employeeId: string;
};

const VALID_SECTIONS: HrmEmployeeProfileSectionId[] = [
  "basic",
  "employment",
  "organization",
  "contact",
  "identity",
  "payroll",
  "attendance_leave",
  "assets",
  "skills",
  "documents",
  "performance",
  "access",
  "exit",
  "timeline",
];

function parseSection(value: string | null): HrmEmployeeProfileSectionId {
  if (!value) return "basic";
  const mapped = LEGACY_PROFILE_SECTION_MAP[value] ?? value;
  if (VALID_SECTIONS.includes(mapped as HrmEmployeeProfileSectionId)) {
    return mapped as HrmEmployeeProfileSectionId;
  }
  return "basic";
}

export function HrmEmployeeProfileView({ employeeId }: Props) {
  const companyId = useHrCompanyId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<HrmEmployeeProfile | null>(null);
  const [allEmployees, setAllEmployees] = useState<HrmEmployeeRecord[]>([]);
  const [section, setSection] = useState<HrmEmployeeProfileSectionId>(() =>
    parseSection(searchParams.get("section")),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const [p, list] = await Promise.all([
        fetchHrEmployeeProfile(companyId, employeeId),
        fetchHrEmployees(companyId),
      ]);
      setProfile(p);
      setAllEmployees(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load employee profile.");
    } finally {
      setLoading(false);
    }
  }, [companyId, employeeId]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  useEffect(() => {
    setSection(parseSection(searchParams.get("section")));
  }, [searchParams]);

  const handleSectionChange = (next: HrmEmployeeProfileSectionId) => {
    setSection(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", next);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleChange = (patch: Partial<HrmEmployeeProfile>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      if (patch.basic) {
        next.name = [patch.basic.firstName ?? prev.basic.firstName, patch.basic.middleName ?? prev.basic.middleName, patch.basic.lastName ?? prev.basic.lastName]
          .filter(Boolean)
          .join(" ");
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!companyId || !profile) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      await updateHrEmployee(companyId, profile.id, {
        fullName: profile.name,
        email: profile.email,
        phone: profile.phone,
        designation: profile.designation,
        department: profile.department,
        location: profile.location,
        employmentType: profile.employmentType,
        status: profile.status,
        workMode: profile.attendanceLeave.workMode ?? profile.workMode,
      });
      setSaveMessage("Employee record saved. Extended profile fields sync when API endpoints are available.");
      window.setTimeout(() => setSaveMessage(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (!companyId) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{MISSING_COMPANY_CONTEXT_MESSAGE}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading employee profile…
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <>
      {saveMessage ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {saveMessage}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <EmployeeProfileShell
        profile={profile}
        section={section}
        onSectionChange={handleSectionChange}
        allEmployees={allEmployees}
        onSave={handleSave}
        saving={saving}
      >
        <EmployeeProfileSectionContent
          profile={profile}
          section={section}
          allEmployees={allEmployees}
          onChange={handleChange}
        />
      </EmployeeProfileShell>
    </>
  );
}
