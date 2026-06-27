import type {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceSummary,
  BulkImportResult,
  CreateDepartmentPayload,
  CreateEmployeePayload,
  CreateRolePayload,
  CreateTeamPayload,
  UpdateDepartmentPayload,
  UpdateMemberScopePayload,
  UpdateTeamPayload,
  EmployeeDocumentSubmission,
  HrmDepartment,
  HrmDepartmentTeam,
  HrmDocumentStatus,
  HrmDocumentTypeCard,
  HrmEmployeeRecord,
  HrmEmploymentStatus,
  HrmEmploymentType,
  HrmEventDetail,
  HrmEventRecord,
  HrmEventRsvp,
  HrmEventStatus,
  HrmOrgChartEmployee,
  HrmPolicyRecord,
  HrmPolicySection,
  HrmPolicyStatus,
  HrmReportFormat,
  HrmReportRun,
  HrmReportRunStatus,
  HrmReportTemplate,
  HrmRole,
  HrmSetupSection,
  HrmSetupSettings,
  HrmWorkMode,
  LeaveBalance,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
  PayrollLineItem,
  PayrollRecord,
  PayrollRunDetail,
  PayrollRunStatus,
  PolicyAcknowledgment,
  UpdateEmployeePayload,
} from "@/types/hrm";

function pick<T>(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

const EMPLOYMENT_STATUSES = new Set<HrmEmploymentStatus>([
  "active",
  "on_leave",
  "probation",
  "offboarding",
  "terminated",
  "inactive",
]);

const EMPLOYMENT_TYPES = new Set<HrmEmploymentType>([
  "full_time",
  "part_time",
  "contract",
  "intern",
]);

const WORK_MODES = new Set<HrmWorkMode>(["onsite", "hybrid", "remote"]);

function coerceStatus(raw: unknown): HrmEmploymentStatus {
  const value = String(raw ?? "active").toLowerCase().replace(/\s+/g, "_");
  if (EMPLOYMENT_STATUSES.has(value as HrmEmploymentStatus)) return value as HrmEmploymentStatus;
  if (value === "onleave") return "on_leave";
  if (value === "off_boarding") return "offboarding";
  return "active";
}

function coerceEmploymentType(raw: unknown): HrmEmploymentType {
  const value = String(raw ?? "full_time").toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  if (EMPLOYMENT_TYPES.has(value as HrmEmploymentType)) return value as HrmEmploymentType;
  if (value === "fulltime") return "full_time";
  if (value === "parttime") return "part_time";
  return "full_time";
}

function coerceWorkMode(raw: unknown): HrmWorkMode | undefined {
  if (raw == null) return undefined;
  const value = String(raw).toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  if (WORK_MODES.has(value as HrmWorkMode)) return value as HrmWorkMode;
  if (value === "on_site") return "onsite";
  return undefined;
}

function formatDisplayDate(raw: unknown): string {
  if (raw == null || raw === "") return "—";
  const str = String(raw);
  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }
  return str;
}

function departmentLabel(raw: Record<string, unknown>): string {
  const nested = pick(raw, "department");
  if (nested && typeof nested === "object") {
    const dept = nested as Record<string, unknown>;
    return String(pick(dept, "name", "title") ?? "—");
  }
  return String(pick(raw, "department", "departmentName", "department_name") ?? "—");
}

function departmentId(raw: Record<string, unknown>): string | null {
  const nested = pick(raw, "department");
  if (nested && typeof nested === "object") {
    const dept = nested as Record<string, unknown>;
    const id = pick(dept, "id", "_id");
    return typeof id === "string" ? id : null;
  }
  const id = pick(raw, "departmentId", "department_id");
  return typeof id === "string" ? id : null;
}

function roleLabel(raw: Record<string, unknown>): { id: string | null; name?: string } {
  const nested = pick(raw, "hrRole", "hr_role", "role");
  if (nested && typeof nested === "object") {
    const role = nested as Record<string, unknown>;
    const id = pick(role, "id", "_id");
    return {
      id: typeof id === "string" ? id : null,
      name: String(pick(role, "name", "title") ?? ""),
    };
  }
  const id = pick(raw, "hrRoleId", "hr_role_id", "roleId", "role_id");
  const name = pick(raw, "hrRoleName", "hr_role_name", "roleName", "role_name");
  return {
    id: typeof id === "string" ? id : null,
    name: typeof name === "string" ? name : undefined,
  };
}

export function normalizeEmployee(raw: unknown): HrmEmployeeRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const rawId = pick(r, "id", "_id", "employeeId", "employee_id", "userId", "user_id");
  const id = typeof rawId === "string" ? rawId : typeof rawId === "number" ? String(rawId) : null;
  if (!id) return null;

  const role = roleLabel(r);
  const joining = pick(r, "joiningDate", "joining_date", "joinedAt", "joined_at", "joinDate", "join_date");
  const leaving = pick(r, "leavingDate", "leaving_date", "leftAt", "left_at");

  return {
    id,
    employeeCode: String(
      pick(r, "employeeCode", "employee_code", "empCode", "emp_code", "code") ?? `EMP-${id.slice(-6)}`,
    ),
    name: String(pick(r, "fullName", "full_name", "name") ?? "Unnamed"),
    email: String(pick(r, "email", "workEmail", "work_email") ?? ""),
    phone: pick(r, "phone", "phoneNumber", "phone_number") as string | undefined,
    designation: String(pick(r, "designation", "jobTitle", "job_title", "title") ?? "—"),
    department: departmentLabel(r),
    departmentId: departmentId(r),
    location: String(pick(r, "location", "workLocation", "work_location", "office") ?? "—"),
    managerId: (() => {
      const mid = pick(r, "managerId", "manager_id", "reportsTo", "reports_to");
      return typeof mid === "string" && mid.length > 0 ? mid : null;
    })(),
    hrRoleId: role.id,
    hrRoleName: role.name,
    employmentType: coerceEmploymentType(pick(r, "employmentType", "employment_type", "type")),
    status: coerceStatus(pick(r, "status", "employmentStatus", "employment_status")),
    joinedAt: formatDisplayDate(joining),
    leavingDate: leaving != null ? formatDisplayDate(leaving) : null,
    workMode: coerceWorkMode(pick(r, "workMode", "work_mode")),
  };
}

export function normalizeEmployeesList(raw: unknown): HrmEmployeeRecord[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(normalizeEmployee).filter((e): e is HrmEmployeeRecord => e !== null);
  }
  if (typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    const list = pick(r, "items", "employees", "data", "results");
    if (Array.isArray(list)) return normalizeEmployeesList(list);
  }
  const single = normalizeEmployee(raw);
  return single ? [single] : [];
}

export function normalizeTeam(raw: unknown): HrmDepartmentTeam | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = pick(r, "id", "_id");
  if (typeof id !== "string") return null;
  return {
    id,
    name: String(pick(r, "name", "title") ?? "Team"),
    memberCount: Number(pick(r, "memberCount", "member_count")) || undefined,
    leaderId: (pick(r, "leaderId", "leader_id") as string | null) ?? null,
  };
}

export function normalizeDepartment(raw: unknown): HrmDepartment | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = pick(r, "id", "_id");
  if (typeof id !== "string") return null;

  const teamsRaw = pick(r, "teams");
  const teams = Array.isArray(teamsRaw)
    ? teamsRaw.map(normalizeTeam).filter((t): t is HrmDepartmentTeam => t !== null)
    : [];

  return {
    id,
    name: String(pick(r, "name", "title") ?? "Department"),
    headId: (pick(r, "headId", "head_id") as string | null) ?? null,
    parentId: (pick(r, "parentId", "parent_id") as string | null) ?? null,
    memberCount: Number(pick(r, "memberCount", "member_count")) || undefined,
    teams,
    createdAt: pick(r, "createdAt", "created_at") as string | undefined,
  };
}

export function normalizeTeamsList(raw: unknown): HrmDepartmentTeam[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(normalizeTeam).filter((t): t is HrmDepartmentTeam => t !== null);
  }
  if (typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    const list = pick(r, "items", "teams", "data", "results");
    if (Array.isArray(list)) return normalizeTeamsList(list);
  }
  const single = normalizeTeam(raw);
  return single ? [single] : [];
}

export function normalizeDepartmentsList(raw: unknown): HrmDepartment[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(normalizeDepartment).filter((d): d is HrmDepartment => d !== null);
  }
  if (typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    const list = pick(r, "items", "departments", "data", "results");
    if (Array.isArray(list)) return normalizeDepartmentsList(list);
  }
  const single = normalizeDepartment(raw);
  return single ? [single] : [];
}

export function normalizeRole(raw: unknown): HrmRole | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = pick(r, "id", "_id");
  if (typeof id !== "string") return null;

  const perms = pick(r, "permissions");
  return {
    id,
    name: String(pick(r, "name", "title") ?? "Role"),
    description: pick(r, "description") as string | undefined,
    permissions: Array.isArray(perms) ? perms.map(String) : undefined,
    createdAt: pick(r, "createdAt", "created_at") as string | undefined,
  };
}

export function normalizeRolesList(raw: unknown): HrmRole[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(normalizeRole).filter((r): r is HrmRole => r !== null);
  }
  if (typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    const list = pick(r, "items", "roles", "data", "results");
    if (Array.isArray(list)) return normalizeRolesList(list);
  }
  const single = normalizeRole(raw);
  return single ? [single] : [];
}

function toIsoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return value;
}

export function toCreateEmployeeBody(payload: CreateEmployeePayload): Record<string, unknown> {
  return {
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    employeeCode: payload.employeeCode,
    designation: payload.designation,
    departmentId: payload.departmentId,
    department: payload.department,
    location: payload.location,
    managerId: payload.managerId ?? undefined,
    hrRoleId: payload.hrRoleId ?? undefined,
    employmentType: payload.employmentType,
    status: payload.status,
    joiningDate: toIsoDate(payload.joiningDate) ?? new Date().toISOString(),
    workMode: payload.workMode,
  };
}

export function toUpdateEmployeeBody(payload: UpdateEmployeePayload): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.fullName !== undefined) body.fullName = payload.fullName;
  if (payload.email !== undefined) body.email = payload.email;
  if (payload.phone !== undefined) body.phone = payload.phone;
  if (payload.employeeCode !== undefined) body.employeeCode = payload.employeeCode;
  if (payload.designation !== undefined) body.designation = payload.designation;
  if (payload.departmentId !== undefined) body.departmentId = payload.departmentId;
  if (payload.department !== undefined) body.department = payload.department;
  if (payload.location !== undefined) body.location = payload.location;
  if (payload.managerId !== undefined) body.managerId = payload.managerId ?? null;
  if (payload.hrRoleId !== undefined) body.hrRoleId = payload.hrRoleId ?? null;
  if (payload.employmentType !== undefined) body.employmentType = payload.employmentType;
  if (payload.status !== undefined) body.status = payload.status;
  if (payload.joiningDate !== undefined) body.joiningDate = toIsoDate(payload.joiningDate);
  if (payload.workMode !== undefined) body.workMode = payload.workMode;
  return body;
}

export function toCreateDepartmentBody(payload: CreateDepartmentPayload): Record<string, unknown> {
  return {
    name: payload.name,
    headId: payload.headId ?? undefined,
  };
}

export function toUpdateDepartmentBody(payload: UpdateDepartmentPayload): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.headId !== undefined) body.headId = payload.headId ?? null;
  return body;
}

export function toCreateTeamBody(payload: CreateTeamPayload): Record<string, unknown> {
  return {
    name: payload.name,
    leaderId: payload.leaderId ?? undefined,
  };
}

export function toUpdateTeamBody(payload: UpdateTeamPayload): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.leaderId !== undefined) body.leaderId = payload.leaderId ?? null;
  return body;
}

export function toUpdateMemberScopeBody(payload: UpdateMemberScopePayload): Record<string, unknown> {
  const body: Record<string, unknown> = { dataScope: payload.dataScope };

  if (payload.dataScope === "TEAM") {
    body.departmentId = payload.departmentId ?? null;
    body.teamId = payload.teamId ?? null;
  } else if (payload.dataScope === "DEPARTMENT") {
    body.departmentId = payload.departmentId ?? null;
    body.teamId = null;
  } else {
    body.departmentId = null;
    body.teamId = null;
  }

  return body;
}

export function toCreateRoleBody(payload: CreateRolePayload): Record<string, unknown> {
  return {
    name: payload.name,
    description: payload.description,
    permissions: payload.permissions,
  };
}

const ATTENDANCE_STATUSES = new Set<AttendanceStatus>([
  "present",
  "absent",
  "late",
  "half_day",
  "on_leave",
  "remote",
]);

function coerceAttendanceStatus(raw: unknown): AttendanceStatus {
  const value = String(raw ?? "absent").toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  if (ATTENDANCE_STATUSES.has(value as AttendanceStatus)) return value as AttendanceStatus;
  if (value === "halfday") return "half_day";
  if (value === "onleave") return "on_leave";
  return "absent";
}

const PAYROLL_STATUSES = new Set<PayrollRunStatus>(["draft", "processing", "completed", "failed"]);

function coercePayrollStatus(raw: unknown): PayrollRunStatus {
  const value = String(raw ?? "draft").toLowerCase();
  if (PAYROLL_STATUSES.has(value as PayrollRunStatus)) return value as PayrollRunStatus;
  if (value === "paid") return "completed";
  return "draft";
}

export function normalizeOrgChartEmployee(raw: unknown): HrmOrgChartEmployee | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = pick(r, "id", "_id");
  if (typeof id !== "string") return null;

  const managerRaw = pick(r, "managerId", "manager_id", "reportsTo", "reports_to");
  const managerId =
    managerRaw === null || managerRaw === undefined || managerRaw === ""
      ? null
      : String(managerRaw);

  return {
    id,
    name: String(pick(r, "fullName", "full_name", "name") ?? "Unnamed"),
    designation: String(pick(r, "designation", "jobTitle", "job_title", "title") ?? "—"),
    department: departmentLabel(r),
    managerId,
    email: pick(r, "email", "workEmail", "work_email") as string | undefined,
    unitLabel: pick(r, "unitLabel", "unit_label", "branch") as string | undefined,
    vacant: Boolean(pick(r, "vacant", "isVacant", "is_vacant")),
    starred: Boolean(pick(r, "starred", "isStarred", "is_starred")),
  };
}

export function normalizeOrgChartList(raw: unknown): HrmOrgChartEmployee[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(normalizeOrgChartEmployee).filter((e): e is HrmOrgChartEmployee => e !== null);
  }
  if (typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    const list = pick(r, "items", "employees", "nodes", "data", "results", "tree");
    if (Array.isArray(list)) return normalizeOrgChartList(list);
    if (list && typeof list === "object") {
      const nested = list as Record<string, unknown>;
      const inner = pick(nested, "employees", "nodes", "items");
      if (Array.isArray(inner)) return normalizeOrgChartList(inner);
    }
  }
  const single = normalizeOrgChartEmployee(raw);
  return single ? [single] : [];
}

export function normalizePayrollRecord(raw: unknown): PayrollRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = pick(r, "id", "_id");
  if (typeof id !== "string") return null;

  const gross = Number(pick(r, "grossPay", "gross_pay", "gross") ?? 0);
  const deductions = Number(pick(r, "deductions", "totalDeductions", "total_deductions") ?? 0);
  const net = Number(pick(r, "netPay", "net_pay", "net") ?? gross - deductions);

  return {
    id,
    payslipId: String(pick(r, "payslipId", "payslip_id", "payslipNumber", "payslip_number") ?? id),
    period: String(pick(r, "period", "payPeriod", "pay_period") ?? "—"),
    employeeId: pick(r, "employeeId", "employee_id") as string | undefined,
    employeeName: String(pick(r, "employeeName", "employee_name", "fullName", "full_name", "name") ?? "—"),
    employeeCode: String(pick(r, "employeeCode", "employee_code", "empCode", "emp_code") ?? "—"),
    department: String(pick(r, "department", "departmentName", "department_name") ?? "—"),
    location: String(pick(r, "location", "workLocation", "work_location") ?? "—"),
    grossPay: gross,
    deductions,
    netPay: net,
    currency: String(pick(r, "currency", "currencyCode", "currency_code") ?? "INR"),
    status: coercePayrollStatus(pick(r, "status", "runStatus", "run_status")),
    paidOn: pick(r, "paidOn", "paid_on", "paidAt", "paid_at") as string | undefined,
  };
}

export function normalizePayrollList(raw: unknown): PayrollRecord[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(normalizePayrollRecord).filter((p): p is PayrollRecord => p !== null);
  }
  if (typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    const list = pick(r, "items", "runs", "payslips", "records", "data", "results");
    if (Array.isArray(list)) return normalizePayrollList(list);
  }
  const single = normalizePayrollRecord(raw);
  return single ? [single] : [];
}

function normalizePayrollLineItem(raw: unknown): PayrollLineItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const label = pick(r, "label", "name", "title");
  if (typeof label !== "string") return null;
  const typeRaw = String(pick(r, "type", "category") ?? "earning").toLowerCase();
  return {
    label,
    amount: Number(pick(r, "amount", "value") ?? 0),
    type: typeRaw === "deduction" ? "deduction" : "earning",
  };
}

export function normalizePayrollRunDetail(raw: unknown): PayrollRunDetail | null {
  const base = normalizePayrollRecord(raw);
  if (!base) return null;
  const r = raw as Record<string, unknown>;
  const itemsRaw = pick(r, "lineItems", "line_items", "items", "breakdown");
  const lineItems = Array.isArray(itemsRaw)
    ? itemsRaw.map(normalizePayrollLineItem).filter((i): i is PayrollLineItem => i !== null)
    : undefined;
  return {
    ...base,
    lineItems,
    taxRegion: pick(r, "taxRegion", "tax_region") as string | undefined,
    notes: pick(r, "notes", "remarks") as string | undefined,
  };
}

export function normalizeAttendanceRecord(
  raw: unknown,
  fallback?: Partial<AttendanceRecord>,
): AttendanceRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = pick(r, "id", "_id");
  if (typeof id !== "string") return null;

  const dateRaw = pick(r, "date", "attendanceDate", "attendance_date");
  const date =
    dateRaw != null
      ? formatDisplayDate(new Date(String(dateRaw)))
      : (fallback?.date ?? "—");

  return {
    id,
    date,
    employeeId: (pick(r, "employeeId", "employee_id") as string | undefined) ?? fallback?.employeeId,
    employeeName: String(
      pick(r, "employeeName", "employee_name", "fullName", "full_name", "name") ??
        fallback?.employeeName ??
        "—",
    ),
    employeeCode: String(
      pick(r, "employeeCode", "employee_code", "empCode", "emp_code") ??
        fallback?.employeeCode ??
        "—",
    ),
    department: String(pick(r, "department", "departmentName") ?? fallback?.department ?? "—"),
    location: String(pick(r, "location", "workLocation") ?? fallback?.location ?? "—"),
    checkIn: pick(r, "checkIn", "check_in", "clockIn", "clock_in") as string | undefined,
    checkOut: pick(r, "checkOut", "check_out", "clockOut", "clock_out") as string | undefined,
    hoursWorked: Number(pick(r, "hoursWorked", "hours_worked", "hours") ?? NaN) || undefined,
    status: coerceAttendanceStatus(pick(r, "status", "attendanceStatus", "attendance_status")),
  };
}

export function normalizeAttendanceList(
  raw: unknown,
  fallback?: Partial<AttendanceRecord>,
): AttendanceRecord[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => normalizeAttendanceRecord(item, fallback))
      .filter((r): r is AttendanceRecord => r !== null);
  }
  if (typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    const list = pick(r, "items", "logs", "records", "attendance", "data", "results");
    if (Array.isArray(list)) return normalizeAttendanceList(list, fallback);
  }
  const single = normalizeAttendanceRecord(raw, fallback);
  return single ? [single] : [];
}

export function normalizeAttendanceSummary(raw: unknown): AttendanceSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const month = String(pick(r, "month", "period") ?? "");
  const present = Number(pick(r, "present") ?? 0);
  const remote = Number(pick(r, "remote") ?? 0);
  const late = Number(pick(r, "late") ?? 0);
  const absent = Number(pick(r, "absent") ?? 0);
  const halfDay = Number(pick(r, "halfDay", "half_day") ?? 0);
  const onLeave = Number(pick(r, "onLeave", "on_leave") ?? 0);
  const payableDays = Number(pick(r, "payableDays", "payable_days") ?? present + remote + late + halfDay * 0.5);
  const workingDays = Number(pick(r, "workingDays", "working_days") ?? 0);
  const attendanceRate = Number(
    pick(r, "attendanceRate", "attendance_rate", "rate") ??
      (workingDays > 0 ? Math.round((payableDays / workingDays) * 100) : 0),
  );

  return {
    month,
    present,
    remote,
    late,
    absent,
    halfDay,
    onLeave,
    totalHours: Number(pick(r, "totalHours", "total_hours", "hours") ?? 0),
    payableDays,
    attendanceRate,
    workingDays: workingDays || undefined,
  };
}

export function normalizeBulkImportResult(raw: unknown): BulkImportResult {
  if (!raw || typeof raw !== "object") {
    return { imported: 0, failed: 0 };
  }
  const r = raw as Record<string, unknown>;
  const errorsRaw = pick(r, "errors", "failures");
  const errors = Array.isArray(errorsRaw)
    ? errorsRaw
        .map((e) => {
          if (!e || typeof e !== "object") return null;
          const row = e as Record<string, unknown>;
          const email = pick(row, "email");
          const message = pick(row, "message", "error", "reason");
          if (typeof email !== "string") return null;
          return { email, message: String(message ?? "Import failed") };
        })
        .filter((e): e is { email: string; message: string } => e !== null)
    : undefined;

  return {
    imported: Number(pick(r, "imported", "successCount", "success_count", "created") ?? 0),
    failed: Number(pick(r, "failed", "failedCount", "failed_count", "errorsCount") ?? 0),
    errors,
  };
}

const LEAVE_STATUSES = new Set<LeaveStatus>(["pending", "approved", "rejected", "cancelled"]);

function coerceLeaveStatus(raw: unknown): LeaveStatus {
  const value = String(raw ?? "pending").toLowerCase();
  if (LEAVE_STATUSES.has(value as LeaveStatus)) return value as LeaveStatus;
  return "pending";
}

function coerceLeaveType(raw: unknown): LeaveType | string {
  const value = String(raw ?? "annual").toLowerCase().replace(/\s+/g, "_");
  return value;
}

function formatShortDate(raw: unknown): string {
  if (raw == null || raw === "") return "—";
  const str = String(raw);
  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return str;
}

function extractList(raw: unknown, keys: string[]): unknown[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    for (const key of keys) {
      const list = r[key];
      if (Array.isArray(list)) return list;
    }
  }
  return [];
}

export function normalizeLeaveRequest(raw: unknown): LeaveRequest | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = pick(r, "id", "_id");
  if (typeof id !== "string") return null;

  return {
    id,
    requestId: String(pick(r, "requestId", "request_id", "reference", "code") ?? id),
    employeeId: pick(r, "employeeId", "employee_id") as string | undefined,
    employeeName: String(pick(r, "employeeName", "employee_name", "fullName", "full_name", "name") ?? "—"),
    employeeCode: String(pick(r, "employeeCode", "employee_code", "empCode", "emp_code") ?? "—"),
    department: String(pick(r, "department", "departmentName") ?? "—"),
    leaveType: coerceLeaveType(pick(r, "leaveType", "leave_type", "type")),
    status: coerceLeaveStatus(pick(r, "status")),
    from: formatShortDate(pick(r, "from", "startDate", "start_date", "fromDate")),
    to: formatShortDate(pick(r, "to", "endDate", "end_date", "toDate")),
    days: Number(pick(r, "days", "dayCount", "day_count", "duration") ?? 1) || 1,
    reason: pick(r, "reason", "notes", "description") as string | undefined,
    approver: pick(r, "approver", "approvedBy", "approved_by", "reviewer") as string | undefined,
    submittedAt: formatShortDate(
      pick(r, "submittedAt", "submitted_at", "createdAt", "created_at", "appliedAt"),
    ),
  };
}

export function normalizeLeaveList(raw: unknown): LeaveRequest[] {
  return extractList(raw, ["items", "requests", "leaveRequests", "leave_requests", "data", "results"])
    .map((item) => normalizeLeaveRequest(item))
    .filter((r): r is LeaveRequest => r !== null);
}

export function normalizeLeaveBalance(raw: unknown): LeaveBalance | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const leaveType = coerceLeaveType(pick(r, "leaveType", "leave_type", "type"));
  const balance = Number(pick(r, "balance", "remaining", "available") ?? NaN);
  if (Number.isNaN(balance)) return null;
  return {
    leaveType,
    label: pick(r, "label", "name") as string | undefined,
    balance,
    used: Number(pick(r, "used", "consumed") ?? NaN) || undefined,
    total: Number(pick(r, "total", "allocated", "entitlement") ?? NaN) || undefined,
  };
}

export function normalizeLeaveBalancesList(raw: unknown): LeaveBalance[] {
  return extractList(raw, ["items", "balances", "leaveBalances", "leave_balances", "data", "results"])
    .map((item) => normalizeLeaveBalance(item))
    .filter((b): b is LeaveBalance => b !== null);
}

const EVENT_STATUSES = new Set<HrmEventStatus>(["draft", "published", "completed", "cancelled"]);

function coerceEventStatus(raw: unknown): HrmEventStatus {
  const value = String(raw ?? "draft").toLowerCase();
  if (EVENT_STATUSES.has(value as HrmEventStatus)) return value as HrmEventStatus;
  return "draft";
}

export function normalizeEventRecord(raw: unknown): HrmEventRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = pick(r, "id", "_id");
  if (typeof id !== "string") return null;

  return {
    id,
    title: String(pick(r, "title", "name") ?? "Untitled event"),
    type: String(pick(r, "type", "eventType", "event_type") ?? "town_hall"),
    status: coerceEventStatus(pick(r, "status")),
    date: formatShortDate(pick(r, "date", "eventDate", "event_date")),
    time: String(pick(r, "time", "startTime", "start_time") ?? "—"),
    location: String(pick(r, "location", "venue") ?? "—"),
    organizer: String(pick(r, "organizer", "organiser", "owner", "createdBy") ?? "—"),
    capacity: Number(pick(r, "capacity", "maxCapacity", "max_capacity") ?? 0) || 0,
    rsvpYes: Number(pick(r, "rsvpYes", "rsvp_yes", "yesCount", "yes_count", "attending") ?? 0) || 0,
    rsvpNo: Number(pick(r, "rsvpNo", "rsvp_no", "noCount", "no_count", "declined") ?? 0) || 0,
    description: String(pick(r, "description", "details", "agenda") ?? ""),
  };
}

export function normalizeEventList(raw: unknown): HrmEventRecord[] {
  return extractList(raw, ["items", "events", "data", "results"])
    .map((item) => normalizeEventRecord(item))
    .filter((e): e is HrmEventRecord => e !== null);
}

export function normalizeEventRsvp(raw: unknown): HrmEventRsvp | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const employeeId = pick(r, "employeeId", "employee_id");
  if (typeof employeeId !== "string") return null;
  const responseRaw = String(pick(r, "response", "rsvp", "answer") ?? "no").toLowerCase();
  return {
    employeeId,
    employeeName: String(pick(r, "employeeName", "employee_name", "name") ?? "—"),
    employeeCode: pick(r, "employeeCode", "employee_code") as string | undefined,
    response: responseRaw === "yes" || responseRaw === "true" || responseRaw === "attending" ? "yes" : "no",
    respondedAt: formatShortDate(pick(r, "respondedAt", "responded_at", "createdAt")),
  };
}

export function normalizeEventDetail(raw: unknown): HrmEventDetail | null {
  const base = normalizeEventRecord(raw);
  if (!base) return null;
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  const rsvpsRaw = extractList(pick(r, "rsvps", "responses", "attendees"), ["items", "rsvps", "responses"]);
  const rsvps = rsvpsRaw.map((item) => normalizeEventRsvp(item)).filter((x): x is HrmEventRsvp => x !== null);
  return { ...base, rsvps: rsvps.length ? rsvps : undefined };
}

const DOC_STATUSES = new Set<HrmDocumentStatus>([
  "verified",
  "pending",
  "expired",
  "rejected",
  "not_submitted",
]);

function coerceDocumentStatus(raw: unknown, submitted = true): HrmDocumentStatus {
  if (!submitted) return "not_submitted";
  const value = String(raw ?? "pending").toLowerCase().replace(/\s+/g, "_");
  if (DOC_STATUSES.has(value as HrmDocumentStatus)) return value as HrmDocumentStatus;
  if (value === "notsubmitted" || value === "missing") return "not_submitted";
  if (value === "approved") return "verified";
  return "pending";
}

export function normalizeDocumentType(raw: unknown): HrmDocumentTypeCard | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = pick(r, "id", "_id", "typeId", "type_id");
  if (typeof id !== "string") return null;
  const title = String(pick(r, "title", "name", "label") ?? "Document");
  return {
    id,
    title,
    shortLabel: String(pick(r, "shortLabel", "short_label", "code") ?? title.split(" ")[0]),
    category: String(pick(r, "category", "documentCategory", "document_category") ?? "other"),
    description: String(pick(r, "description", "details") ?? ""),
    mandatory: Boolean(pick(r, "mandatory", "required", "isMandatory", "is_mandatory") ?? false),
    renewalMonths: Number(pick(r, "renewalMonths", "renewal_months") ?? NaN) || undefined,
  };
}

export function normalizeDocumentTypesList(raw: unknown): HrmDocumentTypeCard[] {
  return extractList(raw, ["items", "types", "documentTypes", "document_types", "data", "results"])
    .map((item) => normalizeDocumentType(item))
    .filter((t): t is HrmDocumentTypeCard => t !== null);
}

export function normalizeDocumentSubmission(raw: unknown): EmployeeDocumentSubmission | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const employeeId = pick(r, "employeeId", "employee_id");
  const documentTypeId = pick(r, "documentTypeId", "document_type_id", "typeId", "type_id");
  if (typeof employeeId !== "string" || typeof documentTypeId !== "string") return null;

  const submitted = Boolean(
    pick(r, "submitted", "isSubmitted", "is_submitted") ??
      pick(r, "fileName", "file_name", "fileUrl", "file_url") ??
      pick(r, "submissionId", "submission_id", "id"),
  );
  const submissionId = pick(r, "submissionId", "submission_id", "id", "_id") as string | undefined;

  return {
    submissionId: typeof submissionId === "string" ? submissionId : undefined,
    employeeId,
    employeeCode: String(pick(r, "employeeCode", "employee_code", "empCode") ?? "—"),
    employeeName: String(pick(r, "employeeName", "employee_name", "fullName", "name") ?? "—"),
    department: String(pick(r, "department", "departmentName") ?? "—"),
    location: String(pick(r, "location", "workLocation") ?? "—"),
    documentTypeId,
    submitted,
    status: coerceDocumentStatus(pick(r, "status", "verificationStatus"), submitted),
    submittedAt: formatShortDate(pick(r, "submittedAt", "submitted_at", "uploadedAt", "createdAt")),
    fileName: pick(r, "fileName", "file_name") as string | undefined,
    fileUrl: pick(r, "fileUrl", "file_url", "previewUrl", "preview_url") as string | undefined,
    verifiedBy: pick(r, "verifiedBy", "verified_by", "reviewer") as string | undefined,
  };
}

export function normalizeDocumentSubmissionsList(raw: unknown): EmployeeDocumentSubmission[] {
  return extractList(raw, ["items", "submissions", "employees", "data", "results"])
    .map((item) => normalizeDocumentSubmission(item))
    .filter((s): s is EmployeeDocumentSubmission => s !== null);
}

const POLICY_STATUSES = new Set<HrmPolicyStatus>(["draft", "published", "archived"]);

function coercePolicyStatus(raw: unknown): HrmPolicyStatus {
  const value = String(raw ?? "draft").toLowerCase();
  if (POLICY_STATUSES.has(value as HrmPolicyStatus)) return value as HrmPolicyStatus;
  return "draft";
}

function normalizePolicySection(raw: unknown, index: number): HrmPolicySection | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const heading = String(pick(r, "heading", "title", "name") ?? `Section ${index + 1}`);
  const body = String(pick(r, "body", "content", "text") ?? "");
  const id = String(pick(r, "id", "_id") ?? `s${index + 1}`);
  return { id, heading, body };
}

export function normalizePolicyRecord(raw: unknown): HrmPolicyRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = pick(r, "id", "_id");
  if (typeof id !== "string") return null;

  const sectionsRaw = extractList(pick(r, "sections", "content", "clauses"), ["sections", "items"]);
  const sections = sectionsRaw
    .map((s, i) => normalizePolicySection(s, i))
    .filter((s): s is HrmPolicySection => s !== null);

  const tagsRaw = pick(r, "tags", "labels");
  const tags = Array.isArray(tagsRaw) ? tagsRaw.map((t) => String(t)) : [];

  return {
    id,
    title: String(pick(r, "title", "name") ?? "Untitled policy"),
    category: String(pick(r, "category", "policyCategory", "policy_category") ?? "hr"),
    status: coercePolicyStatus(pick(r, "status")),
    version: String(pick(r, "version", "revision") ?? "1.0"),
    effectiveFrom: formatShortDate(pick(r, "effectiveFrom", "effective_from", "effectiveDate")),
    publishedAt: formatShortDate(pick(r, "publishedAt", "published_at")) || undefined,
    owner: String(pick(r, "owner", "author", "createdBy", "created_by") ?? "HR Team"),
    summary: String(pick(r, "summary", "description", "abstract") ?? ""),
    acknowledgmentRequired: Boolean(
      pick(r, "acknowledgmentRequired", "acknowledgment_required", "requiresAcknowledgment") ?? true,
    ),
    acknowledgedCount: Number(pick(r, "acknowledgedCount", "acknowledged_count", "ackCount") ?? 0) || 0,
    totalEmployees: Number(pick(r, "totalEmployees", "total_employees", "employeeCount") ?? 0) || 0,
    lastUpdated: formatShortDate(pick(r, "lastUpdated", "last_updated", "updatedAt", "updated_at")),
    sections,
    tags,
  };
}

export function normalizePolicyList(raw: unknown): HrmPolicyRecord[] {
  return extractList(raw, ["items", "policies", "data", "results"])
    .map((item) => normalizePolicyRecord(item))
    .filter((p): p is HrmPolicyRecord => p !== null);
}

export function normalizePolicyAcknowledgment(raw: unknown): PolicyAcknowledgment | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const employeeId = pick(r, "employeeId", "employee_id");
  if (typeof employeeId !== "string") return null;
  const statusRaw = String(pick(r, "status", "acknowledgmentStatus") ?? "pending").toLowerCase();
  return {
    employeeId,
    employeeName: String(pick(r, "employeeName", "employee_name", "name") ?? "—"),
    employeeCode: pick(r, "employeeCode", "employee_code") as string | undefined,
    department: pick(r, "department") as string | undefined,
    status: statusRaw,
    acknowledgedAt: formatShortDate(pick(r, "acknowledgedAt", "acknowledged_at", "completedAt")) || undefined,
  };
}

export function normalizePolicyAcknowledgmentsList(raw: unknown): PolicyAcknowledgment[] {
  return extractList(raw, ["items", "acknowledgments", "employees", "data", "results"])
    .map((item) => normalizePolicyAcknowledgment(item))
    .filter((a): a is PolicyAcknowledgment => a !== null);
}

const REPORT_STATUSES = new Set<HrmReportRunStatus>(["ready", "generating", "failed"]);

function coerceReportRunStatus(raw: unknown): HrmReportRunStatus {
  const value = String(raw ?? "generating").toLowerCase();
  if (REPORT_STATUSES.has(value as HrmReportRunStatus)) return value as HrmReportRunStatus;
  if (value === "completed" || value === "success" || value === "done") return "ready";
  if (value === "processing" || value === "pending" || value === "queued" || value === "running") {
    return "generating";
  }
  if (value === "error" || value === "failed") return "failed";
  return "generating";
}

function coerceReportFormat(raw: unknown): HrmReportFormat | string {
  const value = String(raw ?? "csv").toLowerCase();
  if (value === "pdf" || value === "xlsx" || value === "csv") return value;
  if (value === "excel") return "xlsx";
  return value;
}

export function normalizeReportTemplate(raw: unknown): HrmReportTemplate | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = pick(r, "id", "_id", "templateId", "template_id");
  if (typeof id !== "string") return null;
  return {
    id,
    name: String(pick(r, "name", "title", "label") ?? "Report"),
    category: String(pick(r, "category", "type") ?? "headcount"),
    description: String(pick(r, "description", "summary", "details") ?? ""),
    defaultFormat: coerceReportFormat(pick(r, "defaultFormat", "default_format", "format")),
    estimatedMinutes: Number(pick(r, "estimatedMinutes", "estimated_minutes", "etaMinutes") ?? 2) || 2,
  };
}

export function normalizeReportTemplatesList(raw: unknown): HrmReportTemplate[] {
  return extractList(raw, ["items", "templates", "data", "results"])
    .map((item) => normalizeReportTemplate(item))
    .filter((t): t is HrmReportTemplate => t !== null);
}

export function normalizeReportRun(raw: unknown): HrmReportRun | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = pick(r, "id", "_id", "runId", "run_id");
  if (typeof id !== "string") return null;
  const templateId = String(pick(r, "templateId", "template_id") ?? "");
  const fileSizeRaw = pick(r, "fileSize", "file_size", "size");
  const fileSize =
    typeof fileSizeRaw === "number"
      ? `${Math.round(fileSizeRaw / 1024)} KB`
      : (fileSizeRaw as string | undefined);

  return {
    id,
    templateId,
    name: String(pick(r, "name", "title", "reportName", "report_name") ?? "Report run"),
    category: String(pick(r, "category", "type") ?? "headcount"),
    format: coerceReportFormat(pick(r, "format", "exportFormat", "export_format")),
    status: coerceReportRunStatus(pick(r, "status", "state")),
    period: String(pick(r, "period", "reportingPeriod", "reporting_period") ?? "—"),
    generatedBy: String(pick(r, "generatedBy", "generated_by", "createdBy", "owner") ?? "—"),
    generatedAt: formatShortDate(
      pick(r, "generatedAt", "generated_at", "createdAt", "created_at", "completedAt"),
    ),
    fileSize,
    recordCount: Number(pick(r, "recordCount", "record_count", "rows", "totalRecords") ?? NaN) || undefined,
  };
}

export function normalizeReportRunsList(raw: unknown): HrmReportRun[] {
  return extractList(raw, ["items", "runs", "reportRuns", "report_runs", "data", "results"])
    .map((item) => normalizeReportRun(item))
    .filter((r): r is HrmReportRun => r !== null);
}

function mergeSetupSection<K extends HrmSetupSection>(
  defaults: HrmSetupSettings,
  key: K,
  raw: unknown,
): HrmSetupSettings[K] {
  if (raw && typeof raw === "object") {
    return { ...defaults[key], ...(raw as object) } as HrmSetupSettings[K];
  }
  return defaults[key];
}

export function normalizeHrmSettings(raw: unknown, defaults: HrmSetupSettings): HrmSetupSettings {
  if (!raw || typeof raw !== "object") return defaults;
  const r = raw as Record<string, unknown>;
  const settingsRoot = (pick(r, "settings", "sections", "data") as Record<string, unknown> | undefined) ?? r;

  return {
    general: mergeSetupSection(defaults, "general", settingsRoot.general ?? r.general),
    regional: mergeSetupSection(defaults, "regional", settingsRoot.regional ?? r.regional),
    leave: mergeSetupSection(defaults, "leave", settingsRoot.leave ?? r.leave),
    attendance: mergeSetupSection(defaults, "attendance", settingsRoot.attendance ?? r.attendance),
    payroll: {
      ...mergeSetupSection(defaults, "payroll", settingsRoot.payroll ?? r.payroll),
      salaryComponents:
        (() => {
          const merged = mergeSetupSection(defaults, "payroll", settingsRoot.payroll ?? r.payroll);
          return merged.salaryComponents?.length ? merged.salaryComponents : defaults.payroll.salaryComponents;
        })(),
    },
    compliance: mergeSetupSection(defaults, "compliance", settingsRoot.compliance ?? r.compliance),
    notifications: mergeSetupSection(defaults, "notifications", settingsRoot.notifications ?? r.notifications),
    integrations: mergeSetupSection(defaults, "integrations", settingsRoot.integrations ?? r.integrations),
  };
}
