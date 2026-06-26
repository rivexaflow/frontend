export type HrmEmploymentStatus =
  | "active"
  | "on_leave"
  | "probation"
  | "offboarding"
  | "resigned"
  | "terminated"
  | "inactive";

export type HrmEmploymentType = "full_time" | "part_time" | "contract" | "intern" | "freelancer";

export type HrmWorkMode = "onsite" | "hybrid" | "remote";

/** Normalized employee record used across HRM UI. */
export type HrmEmployeeRecord = {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone?: string;
  designation: string;
  department: string;
  departmentId?: string | null;
  location: string;
  managerId: string | null;
  hrRoleId?: string | null;
  hrRoleName?: string;
  employmentType: HrmEmploymentType;
  status: HrmEmploymentStatus;
  joinedAt: string;
  leavingDate?: string | null;
  workMode?: HrmWorkMode;
};

/** Profile section ids for the full employee profile page. */
export type HrmEmployeeProfileSectionId =
  | "basic"
  | "employment"
  | "organization"
  | "contact"
  | "identity"
  | "payroll"
  | "attendance_leave"
  | "assets"
  | "skills"
  | "documents"
  | "performance"
  | "access"
  | "exit"
  | "timeline";

export type HrmEmployeeBasicInfo = {
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  profilePictureUrl?: string;
  gender?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  nationality?: string;
  bloodGroup?: string;
  personalEmail?: string;
  personalMobile?: string;
};

export type HrmEmployeeEmploymentDetails = {
  employeeCategory?: string;
  confirmationDate?: string;
  teamLead?: string;
  workLocation?: string;
  officeBranch?: string;
  costCenter?: string;
  gradeBand?: string;
  shiftAssignment?: string;
};

export type HrmEmployeeOrganizationInfo = {
  businessUnit?: string;
  division?: string;
  department: string;
  team?: string;
  reportingManager?: string;
  skipLevelManager?: string;
  hrManager?: string;
};

export type HrmEmployeeContactInfo = {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  permanentSameAsCurrent?: boolean;
  permanentAddressLine1?: string;
  permanentAddressLine2?: string;
  permanentCity?: string;
  permanentState?: string;
  permanentCountry?: string;
  permanentPostalCode?: string;
  emergencyName?: string;
  emergencyRelationship?: string;
  emergencyMobile?: string;
  emergencyAlternate?: string;
};

export type HrmIdentityRegion = "india" | "international";

export type HrmEmployeeIdentityInfo = {
  region: HrmIdentityRegion;
  panNumber?: string;
  aadhaarNumber?: string;
  passportNumber?: string;
  drivingLicense?: string;
  uan?: string;
  esicNumber?: string;
  socialSecurityNumber?: string;
  taxId?: string;
  visaNumber?: string;
  workPermitNumber?: string;
};

export type HrmEmployeePayrollInfo = {
  ctc?: number;
  basicSalary?: number;
  allowances?: number;
  bankName?: string;
  accountNumber?: string;
  ifscSwift?: string;
  paymentMethod?: string;
  taxRegime?: string;
  currency?: string;
  payFrequency?: string;
  lastPaidPeriod?: string;
};

export type HrmEmployeeAttendanceLeaveInfo = {
  shift?: string;
  weeklyOff?: string;
  attendancePolicy?: string;
  leavePolicy?: string;
  workMode?: HrmWorkMode;
  workingHours?: string;
  overtimeEligible?: boolean;
  annualBalance?: number;
  sickBalance?: number;
  pendingRequests?: number;
  attendanceRate?: number;
};

export type HrmEmployeeAssetsInfo = {
  laptopAssigned?: boolean;
  laptopSerial?: string;
  monitor?: string;
  phone?: string;
  accessCard?: string;
  simCard?: string;
  softwareLicenses?: string;
};

export type HrmEmployeeSkillsInfo = {
  primarySkills?: string;
  secondarySkills?: string;
  certifications?: string;
  yearsOfExperience?: number;
  previousEmployer?: string;
  linkedIn?: string;
  portfolio?: string;
  resumeFileName?: string;
};

export type HrmEmployeeDocumentItem = {
  id: string;
  name: string;
  type: string;
  status: "verified" | "pending" | "expired";
  uploadedAt: string;
};

export type HrmEmployeeAssetItem = {
  id: string;
  name: string;
  category: string;
  serialNumber?: string;
  assignedAt: string;
  status: "assigned" | "returned" | "lost";
};

export type HrmEmployeeSkillItem = {
  id: string;
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  certified?: boolean;
  expiryDate?: string;
};

export type HrmEmployeePerformanceReview = {
  id: string;
  period: string;
  rating: number;
  reviewer: string;
  summary: string;
};

export type HrmEmployeePerformanceInfo = {
  probationStatus?: string;
  performanceRating?: number;
  kpis?: string;
  goals?: string;
  promotionHistory?: string;
  appraisalHistory?: string;
  reviews: HrmEmployeePerformanceReview[];
};

export type HrmEmployeeActivityItem = {
  id: string;
  action: string;
  detail?: string;
  occurredAt: string;
  actor?: string;
};

export type HrmEmployeeExitInfo = {
  status: "none" | "initiated" | "in_progress" | "completed";
  noticePeriodDays?: number;
  reason?: string;
  lastWorkingDay?: string;
  exitInterview?: string;
  assetReturnStatus?: string;
  fullAndFinalStatus?: string;
  clearanceProgress?: number;
  notes?: string;
};

export type HrmEmployeeAccessInfo = {
  userRole?: string;
  permissions?: string;
  departmentAccess?: string;
  projectAccess?: string;
  crmAccess?: boolean;
  financeAccess?: boolean;
  adminRights?: boolean;
  hrRoleName?: string;
  dataScope?: MemberDataScope;
  workspaceUserLinked?: boolean;
  lastLogin?: string;
  mfaEnabled?: boolean;
};

/** Extended employee profile — directory record + HRMS sections. */
export type HrmEmployeeProfile = HrmEmployeeRecord & {
  basic: HrmEmployeeBasicInfo;
  employmentDetails: HrmEmployeeEmploymentDetails;
  organization: HrmEmployeeOrganizationInfo;
  contact: HrmEmployeeContactInfo;
  identity: HrmEmployeeIdentityInfo;
  payroll: HrmEmployeePayrollInfo;
  attendanceLeave: HrmEmployeeAttendanceLeaveInfo;
  assetsInfo: HrmEmployeeAssetsInfo;
  skillsInfo: HrmEmployeeSkillsInfo;
  documents: HrmEmployeeDocumentItem[];
  assetItems: HrmEmployeeAssetItem[];
  skillItems: HrmEmployeeSkillItem[];
  performance: HrmEmployeePerformanceInfo;
  access: HrmEmployeeAccessInfo;
  timeline: HrmEmployeeActivityItem[];
  exit: HrmEmployeeExitInfo;
};

export type HrmDepartmentTeam = {
  id: string;
  name: string;
  memberCount?: number;
  leaderId?: string | null;
};

export type HrmDepartment = {
  id: string;
  name: string;
  headId?: string | null;
  parentId?: string | null;
  memberCount?: number;
  teams: HrmDepartmentTeam[];
  createdAt?: string;
  children?: HrmDepartment[];
};

export type HrmRole = {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  createdAt?: string;
};

export type EmployeesListQuery = {
  status?: string;
  search?: string;
};

export type CreateEmployeePayload = {
  fullName: string;
  email: string;
  phone?: string;
  employeeCode?: string;
  designation: string;
  departmentId?: string;
  department?: string;
  location?: string;
  managerId?: string | null;
  hrRoleId?: string | null;
  employmentType?: HrmEmploymentType;
  status?: HrmEmploymentStatus;
  joiningDate?: string;
  workMode?: HrmWorkMode;
  roleType?: string;
  teamId?: string | null;
  assignedTeamIds?: string[];
};

export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;

export type CreateDepartmentPayload = {
  name: string;
  headId?: string | null;
  parentId?: string | null;
};

export type UpdateDepartmentPayload = {
  name?: string;
  headId?: string | null;
  parentId?: string | null;
};

export type CreateTeamPayload = {
  name: string;
  leaderId?: string | null;
};

export type UpdateTeamPayload = {
  name?: string;
  leaderId?: string | null;
};

export type MemberDataScope = "SELF" | "TEAM" | "DEPARTMENT" | "COMPANY";

export type UpdateMemberScopePayload = {
  dataScope: MemberDataScope;
  teamId?: string | null;
  departmentId?: string | null;
};

export type CreateRolePayload = {
  name: string;
  description?: string;
  permissions?: string[];
};

export type UpdateRolePayload = {
  name?: string;
  description?: string;
  permissions?: string[];
};

/** Org chart node — same shape used by organization-chart UI. */
export type HrmOrgChartEmployee = {
  id: string;
  name: string;
  designation: string;
  department: string;
  managerId: string | null;
  email?: string;
  unitLabel?: string;
  vacant?: boolean;
  starred?: boolean;
};

export type BulkImportEmployeeRow = {
  fullName: string;
  email: string;
  salaryAmount?: number;
};

export type BulkImportPayload = {
  employees: BulkImportEmployeeRow[];
};

export type BulkImportResult = {
  imported: number;
  failed: number;
  errors?: { email: string; message: string }[];
};

export type PayrollRunStatus = "draft" | "processing" | "completed" | "failed";

export type PayrollRecord = {
  id: string;
  payslipId: string;
  period: string;
  employeeId?: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  location: string;
  grossPay: number;
  deductions: number;
  netPay: number;
  currency: string;
  status: PayrollRunStatus;
  paidOn?: string;
};

export type PayrollLineItem = {
  label: string;
  amount: number;
  type?: "earning" | "deduction";
};

export type PayrollRunDetail = PayrollRecord & {
  lineItems?: PayrollLineItem[];
  taxRegion?: string;
  notes?: string;
};

export type TriggerPayrollRunPayload = {
  period: string;
  month?: number;
  year?: number;
};

export type PayrollRunsQuery = {
  period?: string;
  status?: string;
};

export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "half_day"
  | "on_leave"
  | "remote";

export type AttendanceRecord = {
  id: string;
  date: string;
  employeeId?: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  location: string;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
  status: AttendanceStatus;
};

export type AttendanceLogsQuery = {
  from?: string;
  to?: string;
};

export type AttendanceSummary = {
  month: string;
  present: number;
  remote: number;
  late: number;
  absent: number;
  halfDay: number;
  onLeave: number;
  totalHours: number;
  payableDays: number;
  attendanceRate: number;
  workingDays?: number;
};

export type AttendanceCheckPayload = {
  employeeId: string;
  notes?: string;
};

export type AttendanceCorrectionPayload = {
  checkIn?: string;
  checkOut?: string;
  status?: AttendanceStatus;
};

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export type LeaveType = "annual" | "sick" | "unpaid" | "maternity" | "personal";

export type LeaveRequest = {
  id: string;
  requestId: string;
  employeeId?: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  leaveType: LeaveType | string;
  status: LeaveStatus;
  from: string;
  to: string;
  days: number;
  reason?: string;
  approver?: string;
  submittedAt: string;
};

export type LeaveRequestsQuery = {
  status?: string;
  leaveType?: string;
  search?: string;
};

export type ApplyLeavePayload = {
  employeeId: string;
  leaveType: string;
  from: string;
  to: string;
  days: number;
  reason?: string;
};

export type LeaveBalance = {
  leaveType: LeaveType | string;
  label?: string;
  balance: number;
  used?: number;
  total?: number;
};

export type HrmEventType = "town_hall" | "training" | "social" | "holiday" | "onboarding";

export type HrmEventStatus = "draft" | "published" | "completed" | "cancelled";

export type HrmEventRecord = {
  id: string;
  title: string;
  type: HrmEventType | string;
  status: HrmEventStatus;
  date: string;
  time: string;
  location: string;
  organizer: string;
  capacity: number;
  rsvpYes: number;
  rsvpNo: number;
  description: string;
};

export type HrmEventRsvp = {
  employeeId: string;
  employeeName: string;
  employeeCode?: string;
  response: "yes" | "no" | string;
  respondedAt?: string;
};

export type HrmEventDetail = HrmEventRecord & {
  rsvps?: HrmEventRsvp[];
};

export type EventsListQuery = {
  type?: string;
  status?: string;
  search?: string;
};

export type CreateEventPayload = {
  title: string;
  type: string;
  date: string;
  time?: string;
  location?: string;
  organizer?: string;
  capacity?: number;
  description?: string;
};

export type UpdateEventPayload = Partial<CreateEventPayload>;

export type EventRsvpPayload = {
  employeeId: string;
  response: string;
};

export type HrmDocumentCategory =
  | "contract"
  | "id_proof"
  | "offer_letter"
  | "certificate"
  | "policy_ack"
  | "other";

export type HrmDocumentStatus = "verified" | "pending" | "expired" | "rejected" | "not_submitted";

export type HrmDocumentTypeCard = {
  id: string;
  title: string;
  shortLabel: string;
  category: HrmDocumentCategory | string;
  description: string;
  mandatory: boolean;
  renewalMonths?: number;
};

export type EmployeeDocumentSubmission = {
  submissionId?: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  location: string;
  documentTypeId: string;
  submitted: boolean;
  status: HrmDocumentStatus;
  submittedAt?: string;
  fileName?: string;
  fileUrl?: string;
  verifiedBy?: string;
};

export type DocumentUploadPayload = {
  employeeId: string;
  documentTypeId: string;
  fileName: string;
  fileUrl: string;
};

export type DocumentVerifyPayload = {
  status: string;
};

export type DocumentRemindPayload = {
  documentTypeId: string;
  employeeIds?: string[];
  message?: string;
};

export type HrmPolicyCategory = "hr" | "leave" | "conduct" | "safety" | "it" | "benefits";

export type HrmPolicyStatus = "draft" | "published" | "archived";

export type HrmPolicySection = {
  id: string;
  heading: string;
  body: string;
};

export type HrmPolicyRecord = {
  id: string;
  title: string;
  category: HrmPolicyCategory | string;
  status: HrmPolicyStatus;
  version: string;
  effectiveFrom: string;
  publishedAt?: string;
  owner: string;
  summary: string;
  acknowledgmentRequired: boolean;
  acknowledgedCount: number;
  totalEmployees: number;
  lastUpdated: string;
  sections: HrmPolicySection[];
  tags: string[];
};

export type PolicyAcknowledgment = {
  employeeId: string;
  employeeName: string;
  employeeCode?: string;
  department?: string;
  status: "acknowledged" | "pending" | "overdue" | string;
  acknowledgedAt?: string;
};

export type PoliciesListQuery = {
  category?: string;
  status?: string;
  search?: string;
};

export type CreatePolicyPayload = {
  title: string;
  category: string;
  summary: string;
  sections?: { heading: string; body: string }[];
};

export type UpdatePolicyPayload = {
  title?: string;
  summary?: string;
  sections?: { heading: string; body: string }[];
};

export type PolicyAcknowledgePayload = {
  employeeId: string;
};

export type HrmSetupSection =
  | "general"
  | "regional"
  | "leave"
  | "attendance"
  | "payroll"
  | "compliance"
  | "notifications"
  | "integrations";

export type HrmSetupSettings = {
  general: {
    fiscalYearStart: string;
    workWeekDays: number;
    employeeIdPrefix: string;
    probationDays: number;
    noticePeriodDays: number;
    autoGenerateEmployeeCode: boolean;
  };
  regional: {
    defaultTimezone: string;
    defaultLocale: string;
    dateFormat: string;
    weekStartsOn: "monday" | "sunday";
    defaultCurrency: string;
    supportedCountries: string[];
  };
  leave: {
    annualLeaveDays: number;
    sickLeaveDays: number;
    carryForwardMax: number;
    approvalRequired: boolean;
    halfDayAllowed: boolean;
    sandwichRuleEnabled: boolean;
    maxConsecutiveDays: number;
  };
  attendance: {
    salaryMonthCutoff: number;
    graceMinutes: number;
    autoMarkAbsent: boolean;
    remoteCheckInAllowed: boolean;
    overtimeEnabled: boolean;
    geoFenceRequired: boolean;
    maxRemoteDaysPerMonth: number;
  };
  payroll: {
    payFrequency: "monthly" | "biweekly" | "weekly";
    payDay: number;
    taxRegion: string;
    pfEnabled: boolean;
    esiEnabled: boolean;
    proRataOnJoin: boolean;
  };
  compliance: {
    dataRetentionYears: number;
    gdprMode: boolean;
    auditLogEnabled: boolean;
    mandatoryDocumentTypes: string[];
    poshIcEmail: string;
  };
  notifications: {
    leaveApprovalEmail: boolean;
    payrollRunEmail: boolean;
    policyPublishEmail: boolean;
    documentExpiryEmail: boolean;
    eventReminderHours: number;
    digestFrequency: "daily" | "weekly" | "none";
  };
  integrations: {
    payrollProvider: string;
    biometricEnabled: boolean;
    slackNotifications: boolean;
    googleCalendarSync: boolean;
    webhookUrl: string;
  };
};

export type HrmReportCategory =
  | "headcount"
  | "attrition"
  | "payroll"
  | "attendance"
  | "leave"
  | "compliance";

export type HrmReportFormat = "pdf" | "xlsx" | "csv";

export type HrmReportRunStatus = "ready" | "generating" | "failed";

export type HrmReportTemplate = {
  id: string;
  name: string;
  category: HrmReportCategory | string;
  description: string;
  defaultFormat: HrmReportFormat | string;
  estimatedMinutes: number;
};

export type HrmReportRun = {
  id: string;
  templateId: string;
  name: string;
  category: HrmReportCategory | string;
  format: HrmReportFormat | string;
  status: HrmReportRunStatus;
  period: string;
  generatedBy: string;
  generatedAt: string;
  fileSize?: string;
  recordCount?: number;
};

export type GenerateReportPayload = {
  templateId: string;
  period: string;
  format: string;
};

export type ReportRunsQuery = {
  category?: string;
  search?: string;
};
