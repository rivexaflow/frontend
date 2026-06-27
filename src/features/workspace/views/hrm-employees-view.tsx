"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2, UserCheck } from "lucide-react";

import { CrmShell } from "@/features/workspace/components/crm/crm-panel";
import { HrmCompactBanner } from "@/features/workspace/components/hrm/hrm-compact-banner";
import { AddEmployeeModal } from "@/features/workspace/components/hrm/employees/add-employee-modal";
import { BulkImportModal } from "@/features/workspace/components/hrm/employees/bulk-import-modal";
import { EmployeeDetailPanel } from "@/features/workspace/components/hrm/employees/employee-detail-panel";
import { EmployeesDirectoryGrid } from "@/features/workspace/components/hrm/employees/employees-directory-grid";
import { EmployeesDirectoryTable } from "@/features/workspace/components/hrm/employees/employees-directory-table";
import type { HrmViewMode } from "@/features/workspace/components/hrm/hrm-directory-view-toggle";
import {
  EmployeesDirectoryToolbar,
  type EmployeesFilters,
} from "@/features/workspace/components/hrm/employees/employees-directory-toolbar";
import { useDebouncedSearch } from "@/features/workspace/hooks/use-debounced-search";
import { useListSearchFromUrl } from "@/features/workspace/hooks/use-list-search-from-url";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import { MISSING_COMPANY_CONTEXT_MESSAGE } from "@/lib/workspace/company-context";
import type { HrmEmployeeRecord } from "@/types/hrm";
import type { HrmDepartment, HrmRole } from "@/types/hrm";
import {
  bulkImportHrEmployees,
  createHrEmployee,
  deleteHrEmployee,
  exportHrEmployeesCsv,
  fetchHrDepartments,
  fetchHrEmployees,
  fetchHrRoles,
  updateHrEmployee,
} from "@/lib/api/hrm";

const EMPTY_FILTERS: EmployeesFilters = {
  query: "",
  department: "",
  status: "",
  employmentType: "",
  location: "",
};

function nextEmployeeCode(employees: HrmEmployeeRecord[]) {
  const nums = employees
    .map((e) => parseInt(e.employeeCode.replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n));
  return `EMP-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0")}`;
}

function hasActiveFilters(filters: EmployeesFilters) {
  return Boolean(
    filters.query.trim() ||
      filters.department ||
      filters.location ||
      filters.status ||
      filters.employmentType,
  );
}

export function HrmEmployeesView() {
  const companyId = useHrCompanyId();
  const [employees, setEmployees] = useState<HrmEmployeeRecord[]>([]);
  const [departments, setDepartments] = useState<HrmDepartment[]>([]);
  const [roles, setRoles] = useState<HrmRole[]>([]);
  const [filters, setFilters] = useState<EmployeesFilters>(EMPTY_FILTERS);
  useListSearchFromUrl((value) => setFilters((current) => ({ ...current, query: value })));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<HrmViewMode>("list");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { effectiveQuery } = useDebouncedSearch(filters.query, { minLength: 0, debounceMs: 300 });

  const loadDirectory = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const [employeeList, deptList, roleList] = await Promise.all([
        fetchHrEmployees(companyId, {
          search: effectiveQuery || undefined,
          status: filters.status || undefined,
        }),
        fetchHrDepartments(companyId),
        fetchHrRoles(companyId),
      ]);
      setEmployees(employeeList);
      setDepartments(deptList);
      setRoles(roleList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load employees.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId, effectiveQuery, filters.status]);

  useEffect(() => {
    setLoading(true);
    void loadDirectory();
  }, [loadDirectory]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return employees.filter((emp) => {
      if (q) {
        const hay = `${emp.name} ${emp.email} ${emp.employeeCode} ${emp.designation}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.department && emp.department !== filters.department) return false;
      if (filters.location && emp.location !== filters.location) return false;
      if (filters.employmentType && emp.employmentType !== filters.employmentType) return false;
      return true;
    });
  }, [employees, filters]);

  const selected = selectedId ? employees.find((e) => e.id === selectedId) ?? null : null;
  const filtersActive = hasActiveFilters(filters);

  const departmentNames = useMemo(() => {
    const fromApi = departments.map((d) => d.name);
    const fromEmployees = employees.map((e) => e.department);
    return [...new Set([...fromApi, ...fromEmployees])].filter(Boolean).sort();
  }, [departments, employees]);

  const locations = useMemo(
    () => [...new Set(employees.map((e) => e.location))].filter((l) => l && l !== "—").sort(),
    [employees],
  );

  const activeCount = employees.filter((e) => e.status === "active").length;
  const probationCount = employees.filter((e) => e.status === "probation").length;
  const locationCount = new Set(employees.map((e) => e.location).filter((l) => l && l !== "—")).size;

  const handleRefresh = () => {
    setRefreshing(true);
    void loadDirectory();
  };

  const handleCreate = async (payload: Parameters<typeof createHrEmployee>[1]) => {
    if (!companyId) throw new Error("No company workspace found.");
    const created = await createHrEmployee(companyId, payload);
    setEmployees((prev) => [created, ...prev]);
    setSelectedId(created.id);
    setSuccessMessage(`${created.name} added · starts in probation until onboarding is complete.`);
    window.setTimeout(() => setSuccessMessage(null), 6000);
  };

  const handleUpdate = async (patch: Partial<HrmEmployeeRecord>) => {
    if (!companyId || !selectedId) return;
    const updated = await updateHrEmployee(companyId, selectedId, {
      fullName: patch.name,
      email: patch.email,
      phone: patch.phone,
      designation: patch.designation,
      department: patch.department,
      departmentId: patch.departmentId ?? undefined,
      location: patch.location,
      managerId: patch.managerId,
      hrRoleId: patch.hrRoleId,
      employmentType: patch.employmentType,
      status: patch.status,
      workMode: patch.workMode,
    });
    setEmployees((prev) => prev.map((e) => (e.id === selectedId ? updated : e)));
  };

  const handleDelete = async () => {
    if (!companyId || !selectedId) return;
    await deleteHrEmployee(companyId, selectedId);
    setEmployees((prev) => prev.filter((e) => e.id !== selectedId));
    setSelectedId(null);
  };

  const handleExport = async () => {
    if (!companyId) return;
    setExporting(true);
    try {
      await exportHrEmployeesCsv(companyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const handleBulkImport = async (rows: Parameters<typeof bulkImportHrEmployees>[1]["employees"]) => {
    if (!companyId) throw new Error("No company workspace found.");
    const result = await bulkImportHrEmployees(companyId, { employees: rows });
    setImportMessage(`Imported ${result.imported} employees${result.failed ? `, ${result.failed} failed` : ""}.`);
    await loadDirectory();
  };

  return (
    <div className="pb-8">
      {!companyId ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{MISSING_COMPANY_CONTEXT_MESSAGE}</p>
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <UserCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{successMessage}</p>
        </div>
      ) : null}

      {importMessage ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p>{importMessage}</p>
        </div>
      ) : null}

      <CrmShell>
        <HrmCompactBanner
          title="Employees"
          subtitle="Workforce directory · status, reporting lines, contact"
          stats={[
            { label: "Headcount", value: employees.length },
            { label: "Active", value: activeCount, tone: "success" },
            { label: "Probation", value: probationCount, tone: "warning" },
            { label: "Locations", value: locationCount },
          ]}
        />
        <EmployeesDirectoryToolbar
          filters={filters}
          onChange={setFilters}
          departments={departmentNames}
          locations={locations}
          onAdd={() => setAddOpen(true)}
          onExport={companyId ? handleExport : undefined}
          onBulkImport={companyId ? () => setBulkOpen(true) : undefined}
          onRefresh={companyId ? handleRefresh : undefined}
          refreshing={refreshing}
          exporting={exporting}
          resultCount={filtered.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="p-3 md:p-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading employees…
            </div>
          ) : viewMode === "grid" ? (
            <EmployeesDirectoryGrid
              employees={filtered}
              allEmployees={employees}
              selectedId={selectedId}
              onSelect={(emp) => setSelectedId(emp.id)}
              onClearFilters={() => setFilters(EMPTY_FILTERS)}
              isFiltered={filtersActive}
              totalCount={employees.length}
            />
          ) : (
            <EmployeesDirectoryTable
              employees={filtered}
              allEmployees={employees}
              selectedId={selectedId}
              onSelect={(emp) => setSelectedId(emp.id)}
              onClearFilters={() => setFilters(EMPTY_FILTERS)}
              isFiltered={filtersActive}
              totalCount={employees.length}
            />
          )}
        </div>
      </CrmShell>

      <AnimatePresence>
        {selected ? (
          <EmployeeDetailPanel
            key={selected.id}
            employee={selected}
            allEmployees={employees}
            roles={roles}
            onClose={() => setSelectedId(null)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ) : null}
      </AnimatePresence>

      <AddEmployeeModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreate}
        managers={employees.filter((e) => e.status !== "terminated" && e.status !== "inactive")}
        departments={departments}
        roles={roles}
        locations={locations}
        nextEmployeeCode={nextEmployeeCode(employees)}
      />

      <BulkImportModal open={bulkOpen} onClose={() => setBulkOpen(false)} onSubmit={handleBulkImport} />
    </div>
  );
}
