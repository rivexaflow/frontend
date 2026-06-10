"use client";

import { isAxiosError } from "axios";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import {
  normalizeAttendanceList,
  normalizeAttendanceRecord,
  normalizeAttendanceSummary,
  normalizeBulkImportResult,
  normalizeDepartment,
  normalizeDepartmentsList,
  normalizeDocumentSubmission,
  normalizeDocumentSubmissionsList,
  normalizeDocumentTypesList,
  normalizeEmployee,
  normalizeEmployeesList,
  normalizeEventDetail,
  normalizeEventList,
  normalizeEventRecord,
  normalizeLeaveBalancesList,
  normalizeLeaveList,
  normalizeLeaveRequest,
  normalizeOrgChartList,
  normalizePayrollList,
  normalizePayrollRunDetail,
  normalizeHrmSettings,
  normalizePolicyAcknowledgmentsList,
  normalizePolicyList,
  normalizePolicyRecord,
  normalizeReportRun,
  normalizeReportRunsList,
  normalizeReportTemplatesList,
  normalizeRole,
  normalizeRolesList,
  toCreateDepartmentBody,
  toCreateEmployeeBody,
  toCreateRoleBody,
  toUpdateEmployeeBody,
} from "@/lib/api/hrm-normalize";
import { DEMO_HRM_ATTENDANCE } from "@/features/workspace/data/hrm-attendance-demo";
import {
  DEMO_EMPLOYEE_DOCUMENT_SUBMISSIONS,
  HRM_DOCUMENT_TYPES,
} from "@/features/workspace/data/hrm-documents-demo";
import { DEMO_HRM_EMPLOYEE_DIRECTORY } from "@/features/workspace/data/hrm-employees-demo";
import { DEMO_HRM_EVENTS } from "@/features/workspace/data/hrm-events-demo";
import { DEMO_HRM_LEAVE } from "@/features/workspace/data/hrm-leave-demo";
import { DEMO_HRM_EMPLOYEES } from "@/features/workspace/data/hrm-org-demo";
import { DEMO_HRM_PAYROLL } from "@/features/workspace/data/hrm-payroll-demo";
import { DEMO_HRM_POLICIES } from "@/features/workspace/data/hrm-policies-demo";
import { DEMO_HRM_REPORT_RUNS, HRM_REPORT_TEMPLATES } from "@/features/workspace/data/hrm-reports-demo";
import { DEFAULT_HRM_SETUP } from "@/features/workspace/data/hrm-setup-demo";
import { filenameFromContentDisposition, triggerBlobDownload } from "@/lib/hrm/download-blob";
import type {
  ApplyLeavePayload,
  AttendanceCheckPayload,
  AttendanceCorrectionPayload,
  AttendanceLogsQuery,
  AttendanceRecord,
  AttendanceSummary,
  BulkImportPayload,
  BulkImportResult,
  CreateDepartmentPayload,
  CreateEmployeePayload,
  CreateEventPayload,
  CreatePolicyPayload,
  CreateRolePayload,
  DocumentRemindPayload,
  DocumentUploadPayload,
  DocumentVerifyPayload,
  EmployeeDocumentSubmission,
  EmployeesListQuery,
  EventsListQuery,
  EventRsvpPayload,
  HrmDepartment,
  HrmDocumentTypeCard,
  HrmEmployeeRecord,
  HrmEventDetail,
  HrmEventRecord,
  HrmEventStatus,
  HrmOrgChartEmployee,
  HrmPolicyRecord,
  HrmPolicyStatus,
  HrmRole,
  LeaveBalance,
  LeaveRequest,
  LeaveRequestsQuery,
  LeaveStatus,
  PayrollRecord,
  PayrollRunDetail,
  PayrollRunsQuery,
  PayrollRunStatus,
  GenerateReportPayload,
  HrmReportRun,
  HrmReportTemplate,
  HrmSetupSection,
  HrmSetupSettings,
  PoliciesListQuery,
  PolicyAcknowledgePayload,
  PolicyAcknowledgment,
  ReportRunsQuery,
  TriggerPayrollRunPayload,
  UpdateEmployeePayload,
  UpdateEventPayload,
  UpdatePolicyPayload,
} from "@/types/hrm";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
};

const unwrap = <T>(payload: ApiEnvelope<T> | T): T => {
  if (payload && typeof payload === "object" && "data" in (payload as ApiEnvelope<T>)) {
    const inner = (payload as ApiEnvelope<T>).data;
    if (inner !== undefined && inner !== null) return inner as T;
  }
  return payload as T;
};

const assertSuccess = (body: ApiEnvelope<unknown>) => {
  if (body?.success === false) {
    throw new Error(body.message ?? body.error ?? "Request failed.");
  }
};

const apiError = (err: unknown, fallback: string): Error => {
  if (isAxiosError(err)) {
    const body = err.response?.data as ApiEnvelope<unknown> | undefined;
    const msg = body?.message ?? body?.error ?? fallback;
    return new Error(msg);
  }
  return new Error(fallback);
};

const useDummy = () => process.env.NEXT_PUBLIC_HR_USE_DUMMY === "true";

export async function fetchHrEmployees(
  companyId: string,
  query: EmployeesListQuery = {},
): Promise<HrmEmployeeRecord[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.hr.employees(companyId), {
      params: {
        status: query.status || undefined,
        search: query.search || undefined,
      },
    });
    assertSuccess(data);
    return normalizeEmployeesList(unwrap(data));
  } catch (err) {
    if (useDummy()) return DEMO_HRM_EMPLOYEE_DIRECTORY;
    throw apiError(err, "Could not load employees.");
  }
}

export async function fetchHrEmployee(companyId: string, id: string): Promise<HrmEmployeeRecord> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.hr.employee(companyId, id));
    assertSuccess(data);
    const employee = normalizeEmployee(unwrap(data));
    if (!employee) throw new Error("Employee response was invalid.");
    return employee;
  } catch (err) {
    if (useDummy()) {
      const found = DEMO_HRM_EMPLOYEE_DIRECTORY.find((e) => e.id === id);
      if (found) return found;
    }
    throw apiError(err, "Could not load employee details.");
  }
}

export async function createHrEmployee(
  companyId: string,
  payload: CreateEmployeePayload,
): Promise<HrmEmployeeRecord> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(
      endpoints.hr.employees(companyId),
      toCreateEmployeeBody(payload),
    );
    assertSuccess(data);
    const employee = normalizeEmployee(unwrap(data));
    if (!employee) throw new Error("Create employee response was invalid.");
    return employee;
  } catch (err) {
    throw apiError(err, "Could not create employee.");
  }
}

export async function updateHrEmployee(
  companyId: string,
  id: string,
  payload: UpdateEmployeePayload,
): Promise<HrmEmployeeRecord> {
  try {
    const { data } = await apiClient.put<ApiEnvelope<unknown>>(
      endpoints.hr.employee(companyId, id),
      toUpdateEmployeeBody(payload),
    );
    assertSuccess(data);
    const employee = normalizeEmployee(unwrap(data));
    if (!employee) throw new Error("Update employee response was invalid.");
    return employee;
  } catch (err) {
    throw apiError(err, "Could not update employee.");
  }
}

export async function deleteHrEmployee(companyId: string, id: string): Promise<void> {
  try {
    const { data } = await apiClient.delete<ApiEnvelope<unknown>>(endpoints.hr.employee(companyId, id));
    assertSuccess(data);
  } catch (err) {
    throw apiError(err, "Could not delete employee.");
  }
}

export async function fetchHrDepartments(companyId: string): Promise<HrmDepartment[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.hr.departments(companyId));
    assertSuccess(data);
    return normalizeDepartmentsList(unwrap(data));
  } catch (err) {
    if (useDummy()) {
      return [
        { id: "dept_revenue", name: "Revenue", teams: [], memberCount: 4 },
        { id: "dept_ops", name: "Operations", teams: [], memberCount: 3 },
        { id: "dept_people", name: "People", teams: [], memberCount: 2 },
      ];
    }
    throw apiError(err, "Could not load departments.");
  }
}

export async function createHrDepartment(
  companyId: string,
  payload: CreateDepartmentPayload,
): Promise<HrmDepartment> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(
      endpoints.hr.departments(companyId),
      toCreateDepartmentBody(payload),
    );
    assertSuccess(data);
    const department = normalizeDepartment(unwrap(data));
    if (!department) throw new Error("Create department response was invalid.");
    return department;
  } catch (err) {
    throw apiError(err, "Could not create department.");
  }
}

export async function fetchHrRoles(companyId: string): Promise<HrmRole[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.hr.roles(companyId));
    assertSuccess(data);
    return normalizeRolesList(unwrap(data));
  } catch (err) {
    if (useDummy()) {
      return [
        { id: "role_hr_mgr", name: "HR Manager", description: "Full HR operations access" },
        { id: "role_recruiter", name: "Recruiter", description: "Hiring and onboarding" },
        { id: "role_payroll", name: "Payroll Specialist", description: "Payroll processing" },
      ];
    }
    throw apiError(err, "Could not load HR roles.");
  }
}

export async function createHrRole(companyId: string, payload: CreateRolePayload): Promise<HrmRole> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(
      endpoints.hr.roles(companyId),
      toCreateRoleBody(payload),
    );
    assertSuccess(data);
    const role = normalizeRole(unwrap(data));
    if (!role) throw new Error("Create role response was invalid.");
    return role;
  } catch (err) {
    throw apiError(err, "Could not create HR role.");
  }
}

export async function fetchHrOrgChart(companyId: string): Promise<HrmOrgChartEmployee[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.hr.orgChart(companyId));
    assertSuccess(data);
    return normalizeOrgChartList(unwrap(data));
  } catch (err) {
    if (useDummy()) return [...DEMO_HRM_EMPLOYEES];
    throw apiError(err, "Could not load org chart.");
  }
}

export async function reassignHrEmployeeManager(
  companyId: string,
  employeeId: string,
  managerId: string | null,
): Promise<void> {
  try {
    const { data } = await apiClient.put<ApiEnvelope<unknown>>(
      endpoints.hr.employeeManager(companyId, employeeId),
      { managerId },
    );
    assertSuccess(data);
  } catch (err) {
    throw apiError(err, "Could not reassign reporting manager.");
  }
}

export async function exportHrEmployeesCsv(companyId: string): Promise<void> {
  try {
    const response = await apiClient.get(endpoints.hr.employeesExport(companyId), {
      responseType: "blob",
    });
    const filename = filenameFromContentDisposition(
      response.headers["content-disposition"] as string | undefined,
      `employees-${companyId}.csv`,
    );
    triggerBlobDownload(response.data as Blob, filename);
  } catch (err) {
    throw apiError(err, "Could not export employees.");
  }
}

export async function bulkImportHrEmployees(
  companyId: string,
  payload: BulkImportPayload,
): Promise<BulkImportResult> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(
      endpoints.hr.employeesBulkImport(companyId),
      payload,
    );
    assertSuccess(data);
    return normalizeBulkImportResult(unwrap(data));
  } catch (err) {
    throw apiError(err, "Could not bulk import employees.");
  }
}

export async function fetchHrPayrollRuns(
  companyId: string,
  query: PayrollRunsQuery = {},
): Promise<PayrollRecord[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.hr.payrollRuns(companyId), {
      params: {
        period: query.period || undefined,
        status: query.status || undefined,
      },
    });
    assertSuccess(data);
    return normalizePayrollList(unwrap(data));
  } catch (err) {
    if (useDummy()) return DEMO_HRM_PAYROLL;
    throw apiError(err, "Could not load payroll runs.");
  }
}

export async function fetchHrPayrollRun(
  companyId: string,
  id: string,
): Promise<PayrollRunDetail> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.hr.payrollRun(companyId, id));
    assertSuccess(data);
    const detail = normalizePayrollRunDetail(unwrap(data));
    if (!detail) throw new Error("Payroll run response was invalid.");
    return detail;
  } catch (err) {
    if (useDummy()) {
      const found = DEMO_HRM_PAYROLL.find((r) => r.id === id);
      if (found) return { ...found, lineItems: [] };
    }
    throw apiError(err, "Could not load payroll details.");
  }
}

export async function triggerHrPayrollRun(
  companyId: string,
  payload: TriggerPayrollRunPayload,
): Promise<PayrollRecord[]> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(
      endpoints.hr.payrollRuns(companyId),
      payload,
    );
    assertSuccess(data);
    return normalizePayrollList(unwrap(data));
  } catch (err) {
    throw apiError(err, "Could not trigger payroll run.");
  }
}

export async function updateHrPayrollRunStatus(
  companyId: string,
  id: string,
  status: PayrollRunStatus,
): Promise<PayrollRecord> {
  try {
    const { data } = await apiClient.patch<ApiEnvelope<unknown>>(
      endpoints.hr.payrollRunStatus(companyId, id),
      { status },
    );
    assertSuccess(data);
    const record = normalizePayrollList(unwrap(data))[0] ?? normalizePayrollRunDetail(unwrap(data));
    if (!record) throw new Error("Payroll status response was invalid.");
    return record;
  } catch (err) {
    throw apiError(err, "Could not update payroll status.");
  }
}

export async function downloadHrPayrollRun(companyId: string, id: string): Promise<void> {
  try {
    const response = await apiClient.get(endpoints.hr.payrollRunDownload(companyId, id), {
      responseType: "blob",
    });
    const filename = filenameFromContentDisposition(
      response.headers["content-disposition"] as string | undefined,
      `payslip-${id}.pdf`,
    );
    triggerBlobDownload(response.data as Blob, filename);
  } catch (err) {
    throw apiError(err, "Could not download payslip.");
  }
}

export async function fetchHrAttendanceLogs(
  companyId: string,
  employeeId: string,
  query: AttendanceLogsQuery = {},
  fallback?: Partial<AttendanceRecord>,
): Promise<AttendanceRecord[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(
      endpoints.hr.attendanceEmployee(companyId, employeeId),
      { params: { from: query.from, to: query.to } },
    );
    assertSuccess(data);
    return normalizeAttendanceList(unwrap(data), fallback);
  } catch (err) {
    if (useDummy()) {
      return DEMO_HRM_ATTENDANCE.filter((r) => r.employeeCode.includes(employeeId.slice(-3)));
    }
    throw apiError(err, "Could not load attendance logs.");
  }
}

export async function fetchHrAttendanceSummary(
  companyId: string,
  employeeId: string,
  month: string,
): Promise<AttendanceSummary | null> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(
      endpoints.hr.attendanceEmployeeSummary(companyId, employeeId),
      { params: { month } },
    );
    assertSuccess(data);
    return normalizeAttendanceSummary(unwrap(data));
  } catch (err) {
    if (useDummy()) return null;
    throw apiError(err, "Could not load attendance summary.");
  }
}

export async function checkInHrAttendance(
  companyId: string,
  payload: AttendanceCheckPayload,
): Promise<AttendanceRecord> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(
      endpoints.hr.attendanceCheckIn(companyId),
      payload,
    );
    assertSuccess(data);
    const record = normalizeAttendanceRecord(unwrap(data));
    if (!record) throw new Error("Check-in response was invalid.");
    return record;
  } catch (err) {
    throw apiError(err, "Could not check in.");
  }
}

export async function checkOutHrAttendance(
  companyId: string,
  payload: AttendanceCheckPayload,
): Promise<AttendanceRecord> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(
      endpoints.hr.attendanceCheckOut(companyId),
      payload,
    );
    assertSuccess(data);
    const record = normalizeAttendanceRecord(unwrap(data));
    if (!record) throw new Error("Check-out response was invalid.");
    return record;
  } catch (err) {
    throw apiError(err, "Could not check out.");
  }
}

export async function correctHrAttendance(
  companyId: string,
  id: string,
  payload: AttendanceCorrectionPayload,
): Promise<AttendanceRecord> {
  try {
    const { data } = await apiClient.patch<ApiEnvelope<unknown>>(
      endpoints.hr.attendanceRecord(companyId, id),
      payload,
    );
    assertSuccess(data);
    const record = normalizeAttendanceRecord(unwrap(data));
    if (!record) throw new Error("Attendance correction response was invalid.");
    return record;
  } catch (err) {
    throw apiError(err, "Could not update attendance record.");
  }
}

export async function fetchHrLeaveRequests(
  companyId: string,
  query: LeaveRequestsQuery = {},
): Promise<LeaveRequest[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.hr.leaveRequests(companyId), {
      params: {
        status: query.status || undefined,
        leaveType: query.leaveType || undefined,
        search: query.search || undefined,
      },
    });
    assertSuccess(data);
    return normalizeLeaveList(unwrap(data));
  } catch (err) {
    if (useDummy()) return DEMO_HRM_LEAVE;
    throw apiError(err, "Could not load leave requests.");
  }
}

export async function fetchHrLeaveRequest(companyId: string, id: string): Promise<LeaveRequest> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.hr.leaveRequest(companyId, id));
    assertSuccess(data);
    const request = normalizeLeaveRequest(unwrap(data));
    if (!request) throw new Error("Leave request response was invalid.");
    return request;
  } catch (err) {
    if (useDummy()) {
      const found = DEMO_HRM_LEAVE.find((r) => r.id === id);
      if (found) return found;
    }
    throw apiError(err, "Could not load leave request.");
  }
}

export async function applyHrLeaveRequest(
  companyId: string,
  payload: ApplyLeavePayload,
): Promise<LeaveRequest> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(
      endpoints.hr.leaveRequests(companyId),
      payload,
    );
    assertSuccess(data);
    const request = normalizeLeaveRequest(unwrap(data));
    if (!request) throw new Error("Leave application response was invalid.");
    return request;
  } catch (err) {
    throw apiError(err, "Could not submit leave request.");
  }
}

export async function updateHrLeaveRequestStatus(
  companyId: string,
  id: string,
  status: LeaveStatus,
): Promise<LeaveRequest> {
  try {
    const { data } = await apiClient.patch<ApiEnvelope<unknown>>(
      endpoints.hr.leaveRequestStatus(companyId, id),
      { status },
    );
    assertSuccess(data);
    const request = normalizeLeaveRequest(unwrap(data));
    if (!request) throw new Error("Leave status response was invalid.");
    return request;
  } catch (err) {
    throw apiError(err, "Could not update leave status.");
  }
}

export async function fetchHrLeaveBalances(
  companyId: string,
  employeeId: string,
): Promise<LeaveBalance[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(
      endpoints.hr.leaveBalances(companyId, employeeId),
    );
    assertSuccess(data);
    return normalizeLeaveBalancesList(unwrap(data));
  } catch (err) {
    if (useDummy()) return [];
    throw apiError(err, "Could not load leave balances.");
  }
}

export async function fetchHrEvents(
  companyId: string,
  query: EventsListQuery = {},
): Promise<HrmEventRecord[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.hr.events(companyId), {
      params: {
        type: query.type || undefined,
        status: query.status || undefined,
        search: query.search || undefined,
      },
    });
    assertSuccess(data);
    return normalizeEventList(unwrap(data));
  } catch (err) {
    if (useDummy()) return DEMO_HRM_EVENTS;
    throw apiError(err, "Could not load events.");
  }
}

export async function fetchHrEvent(companyId: string, id: string): Promise<HrmEventDetail> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.hr.event(companyId, id));
    assertSuccess(data);
    const detail = normalizeEventDetail(unwrap(data));
    if (!detail) throw new Error("Event response was invalid.");
    return detail;
  } catch (err) {
    if (useDummy()) {
      const found = DEMO_HRM_EVENTS.find((e) => e.id === id);
      if (found) return { ...found, rsvps: [] };
    }
    throw apiError(err, "Could not load event details.");
  }
}

export async function createHrEvent(
  companyId: string,
  payload: CreateEventPayload,
): Promise<HrmEventRecord> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(endpoints.hr.events(companyId), payload);
    assertSuccess(data);
    const event = normalizeEventRecord(unwrap(data));
    if (!event) throw new Error("Create event response was invalid.");
    return event;
  } catch (err) {
    throw apiError(err, "Could not create event.");
  }
}

export async function updateHrEvent(
  companyId: string,
  id: string,
  payload: UpdateEventPayload,
): Promise<HrmEventRecord> {
  try {
    const { data } = await apiClient.put<ApiEnvelope<unknown>>(endpoints.hr.event(companyId, id), payload);
    assertSuccess(data);
    const event = normalizeEventRecord(unwrap(data));
    if (!event) throw new Error("Update event response was invalid.");
    return event;
  } catch (err) {
    throw apiError(err, "Could not update event.");
  }
}

export async function updateHrEventStatus(
  companyId: string,
  id: string,
  status: HrmEventStatus,
): Promise<HrmEventRecord> {
  try {
    const { data } = await apiClient.patch<ApiEnvelope<unknown>>(
      endpoints.hr.eventStatus(companyId, id),
      { status },
    );
    assertSuccess(data);
    const event = normalizeEventRecord(unwrap(data));
    if (!event) throw new Error("Event status response was invalid.");
    return event;
  } catch (err) {
    throw apiError(err, "Could not update event status.");
  }
}

export async function submitHrEventRsvp(
  companyId: string,
  eventId: string,
  payload: EventRsvpPayload,
): Promise<HrmEventDetail> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(
      endpoints.hr.eventRsvp(companyId, eventId),
      payload,
    );
    assertSuccess(data);
    const detail = normalizeEventDetail(unwrap(data));
    if (!detail) throw new Error("RSVP response was invalid.");
    return detail;
  } catch (err) {
    throw apiError(err, "Could not submit RSVP.");
  }
}

export async function fetchHrDocumentTypes(companyId: string): Promise<HrmDocumentTypeCard[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.hr.documentTypes(companyId));
    assertSuccess(data);
    return normalizeDocumentTypesList(unwrap(data));
  } catch (err) {
    if (useDummy()) return HRM_DOCUMENT_TYPES;
    throw apiError(err, "Could not load document types.");
  }
}

export async function fetchHrDocumentTypeSubmissions(
  companyId: string,
  typeId: string,
): Promise<EmployeeDocumentSubmission[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(
      endpoints.hr.documentTypeSubmissions(companyId, typeId),
    );
    assertSuccess(data);
    return normalizeDocumentSubmissionsList(unwrap(data));
  } catch (err) {
    if (useDummy()) {
      return DEMO_EMPLOYEE_DOCUMENT_SUBMISSIONS.filter((s) => s.documentTypeId === typeId);
    }
    throw apiError(err, "Could not load document submissions.");
  }
}

export async function fetchHrDocumentSubmission(
  companyId: string,
  id: string,
): Promise<EmployeeDocumentSubmission> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(
      endpoints.hr.documentSubmission(companyId, id),
    );
    assertSuccess(data);
    const submission = normalizeDocumentSubmission(unwrap(data));
    if (!submission) throw new Error("Document submission response was invalid.");
    return submission;
  } catch (err) {
    throw apiError(err, "Could not load document submission.");
  }
}

export async function fetchHrDocumentPreviewUrl(companyId: string, submissionId: string): Promise<string> {
  try {
    const response = await apiClient.get(endpoints.hr.documentSubmissionPreview(companyId, submissionId), {
      responseType: "blob",
    });
    const contentType = String(response.headers["content-type"] ?? "");
    if (contentType.includes("application/json")) {
      const text = await (response.data as Blob).text();
      const parsed = JSON.parse(text) as { url?: string; previewUrl?: string; data?: { url?: string } };
      const url = parsed.url ?? parsed.previewUrl ?? parsed.data?.url;
      if (url) return url;
    }
    return URL.createObjectURL(response.data as Blob);
  } catch (err) {
    throw apiError(err, "Could not load document preview.");
  }
}

export async function uploadHrDocumentSubmission(
  companyId: string,
  payload: DocumentUploadPayload,
): Promise<EmployeeDocumentSubmission> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(
      endpoints.hr.documentSubmissions(companyId),
      payload,
    );
    assertSuccess(data);
    const submission = normalizeDocumentSubmission(unwrap(data));
    if (!submission) throw new Error("Document upload response was invalid.");
    return submission;
  } catch (err) {
    throw apiError(err, "Could not upload document.");
  }
}

export async function verifyHrDocumentSubmission(
  companyId: string,
  id: string,
  payload: DocumentVerifyPayload,
): Promise<EmployeeDocumentSubmission> {
  try {
    const { data } = await apiClient.patch<ApiEnvelope<unknown>>(
      endpoints.hr.documentSubmissionVerify(companyId, id),
      payload,
    );
    assertSuccess(data);
    const submission = normalizeDocumentSubmission(unwrap(data));
    if (!submission) throw new Error("Document verify response was invalid.");
    return submission;
  } catch (err) {
    throw apiError(err, "Could not verify document.");
  }
}

export async function remindHrDocumentSubmissions(
  companyId: string,
  payload: DocumentRemindPayload,
): Promise<void> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(
      endpoints.hr.documentRemind(companyId),
      payload,
    );
    assertSuccess(data);
  } catch (err) {
    throw apiError(err, "Could not send document reminders.");
  }
}

export async function fetchHrPolicies(
  companyId: string,
  query: PoliciesListQuery = {},
): Promise<HrmPolicyRecord[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.hr.policies(companyId), {
      params: {
        category: query.category || undefined,
        status: query.status || undefined,
        search: query.search || undefined,
      },
    });
    assertSuccess(data);
    return normalizePolicyList(unwrap(data));
  } catch (err) {
    if (useDummy()) return DEMO_HRM_POLICIES;
    throw apiError(err, "Could not load policies.");
  }
}

export async function fetchHrPolicy(companyId: string, id: string): Promise<HrmPolicyRecord> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.hr.policy(companyId, id));
    assertSuccess(data);
    const policy = normalizePolicyRecord(unwrap(data));
    if (!policy) throw new Error("Policy response was invalid.");
    return policy;
  } catch (err) {
    if (useDummy()) {
      const found = DEMO_HRM_POLICIES.find((p) => p.id === id);
      if (found) return found;
    }
    throw apiError(err, "Could not load policy.");
  }
}

export async function createHrPolicy(
  companyId: string,
  payload: CreatePolicyPayload,
): Promise<HrmPolicyRecord> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(endpoints.hr.policies(companyId), payload);
    assertSuccess(data);
    const policy = normalizePolicyRecord(unwrap(data));
    if (!policy) throw new Error("Create policy response was invalid.");
    return policy;
  } catch (err) {
    throw apiError(err, "Could not create policy.");
  }
}

export async function updateHrPolicy(
  companyId: string,
  id: string,
  payload: UpdatePolicyPayload,
): Promise<HrmPolicyRecord> {
  try {
    const { data } = await apiClient.put<ApiEnvelope<unknown>>(endpoints.hr.policy(companyId, id), payload);
    assertSuccess(data);
    const policy = normalizePolicyRecord(unwrap(data));
    if (!policy) throw new Error("Update policy response was invalid.");
    return policy;
  } catch (err) {
    throw apiError(err, "Could not update policy.");
  }
}

export async function updateHrPolicyStatus(
  companyId: string,
  id: string,
  status: HrmPolicyStatus,
): Promise<HrmPolicyRecord> {
  try {
    const { data } = await apiClient.patch<ApiEnvelope<unknown>>(
      endpoints.hr.policyStatus(companyId, id),
      { status },
    );
    assertSuccess(data);
    const policy = normalizePolicyRecord(unwrap(data));
    if (!policy) throw new Error("Policy status response was invalid.");
    return policy;
  } catch (err) {
    throw apiError(err, "Could not update policy status.");
  }
}

export async function fetchHrPolicyAcknowledgments(
  companyId: string,
  policyId: string,
): Promise<PolicyAcknowledgment[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(
      endpoints.hr.policyAcknowledgments(companyId, policyId),
    );
    assertSuccess(data);
    return normalizePolicyAcknowledgmentsList(unwrap(data));
  } catch (err) {
    if (useDummy()) return [];
    throw apiError(err, "Could not load policy acknowledgments.");
  }
}

export async function acknowledgeHrPolicy(
  companyId: string,
  policyId: string,
  payload: PolicyAcknowledgePayload,
): Promise<PolicyAcknowledgment> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(
      endpoints.hr.policyAcknowledge(companyId, policyId),
      payload,
    );
    assertSuccess(data);
    const ack = normalizePolicyAcknowledgmentsList(unwrap(data))[0];
    if (!ack) {
      return {
        employeeId: payload.employeeId,
        employeeName: "Employee",
        status: "acknowledged",
        acknowledgedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
    }
    return ack;
  } catch (err) {
    throw apiError(err, "Could not acknowledge policy.");
  }
}

export async function remindHrPolicyAcknowledgments(companyId: string, policyId: string): Promise<void> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(
      endpoints.hr.policyRemind(companyId, policyId),
    );
    assertSuccess(data);
  } catch (err) {
    throw apiError(err, "Could not send policy reminders.");
  }
}

export async function exportHrPolicyPdf(companyId: string, policyId: string): Promise<void> {
  try {
    const response = await apiClient.get(endpoints.hr.policyExport(companyId, policyId), {
      responseType: "blob",
    });
    const filename = filenameFromContentDisposition(
      response.headers["content-disposition"] as string | undefined,
      `policy-${policyId}.pdf`,
    );
    triggerBlobDownload(response.data as Blob, filename);
  } catch (err) {
    throw apiError(err, "Could not export policy.");
  }
}

export async function fetchHrSettings(companyId: string): Promise<HrmSetupSettings> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.hr.settings(companyId));
    assertSuccess(data);
    return normalizeHrmSettings(unwrap(data), DEFAULT_HRM_SETUP);
  } catch (err) {
    if (useDummy()) return DEFAULT_HRM_SETUP;
    throw apiError(err, "Could not load HRM settings.");
  }
}

export async function saveHrSettingsSection(
  companyId: string,
  section: HrmSetupSection,
  payload: HrmSetupSettings[HrmSetupSection],
): Promise<HrmSetupSettings> {
  try {
    const { data } = await apiClient.put<ApiEnvelope<unknown>>(
      endpoints.hr.settingsSection(companyId, section),
      payload,
    );
    assertSuccess(data);
    const unwrapped = unwrap(data);
    if (unwrapped && typeof unwrapped === "object" && section in (unwrapped as Record<string, unknown>)) {
      return normalizeHrmSettings(unwrapped, DEFAULT_HRM_SETUP);
    }
    return normalizeHrmSettings({ [section]: unwrapped }, DEFAULT_HRM_SETUP);
  } catch (err) {
    throw apiError(err, "Could not save settings.");
  }
}

export async function resetHrSettings(companyId: string): Promise<HrmSetupSettings> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(endpoints.hr.settingsReset(companyId));
    assertSuccess(data);
    return normalizeHrmSettings(unwrap(data), DEFAULT_HRM_SETUP);
  } catch (err) {
    if (useDummy()) return DEFAULT_HRM_SETUP;
    throw apiError(err, "Could not reset settings.");
  }
}

export async function fetchHrReportTemplates(companyId: string): Promise<HrmReportTemplate[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.hr.reportTemplates(companyId));
    assertSuccess(data);
    return normalizeReportTemplatesList(unwrap(data));
  } catch (err) {
    if (useDummy()) return HRM_REPORT_TEMPLATES;
    throw apiError(err, "Could not load report templates.");
  }
}

export async function generateHrReport(
  companyId: string,
  payload: GenerateReportPayload,
): Promise<HrmReportRun> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(
      endpoints.hr.reportGenerate(companyId),
      payload,
    );
    assertSuccess(data);
    const run = normalizeReportRun(unwrap(data));
    if (!run) throw new Error("Report generation response was invalid.");
    return run;
  } catch (err) {
    throw apiError(err, "Could not generate report.");
  }
}

export async function fetchHrReportRuns(
  companyId: string,
  query: ReportRunsQuery = {},
): Promise<HrmReportRun[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.hr.reportRuns(companyId), {
      params: {
        category: query.category || undefined,
        search: query.search || undefined,
      },
    });
    assertSuccess(data);
    return normalizeReportRunsList(unwrap(data));
  } catch (err) {
    if (useDummy()) return DEMO_HRM_REPORT_RUNS;
    throw apiError(err, "Could not load report runs.");
  }
}

export async function fetchHrReportRun(companyId: string, id: string): Promise<HrmReportRun> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.hr.reportRun(companyId, id));
    assertSuccess(data);
    const run = normalizeReportRun(unwrap(data));
    if (!run) throw new Error("Report run response was invalid.");
    return run;
  } catch (err) {
    if (useDummy()) {
      const found = DEMO_HRM_REPORT_RUNS.find((r) => r.id === id);
      if (found) return found;
    }
    throw apiError(err, "Could not load report run.");
  }
}

export async function downloadHrReportRun(companyId: string, id: string): Promise<void> {
  try {
    const response = await apiClient.get(endpoints.hr.reportRunDownload(companyId, id), {
      responseType: "blob",
    });
    const filename = filenameFromContentDisposition(
      response.headers["content-disposition"] as string | undefined,
      `report-${id}`,
    );
    triggerBlobDownload(response.data as Blob, filename);
  } catch (err) {
    throw apiError(err, "Could not download report.");
  }
}
