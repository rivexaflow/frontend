import type { PayrollBatchRun, PayrollRecord, PayrollRunDetail, PayrollRunStatus } from "@/types/hrm";
import {
  DEFAULT_PAYROLL_SALARY_COMPONENTS,
  DEMO_EMPLOYEE_SALARY_STRUCTURES,
  buildPayslipLines,
} from "@/features/workspace/data/hrm-payroll-salary-components";

export type { PayrollRecord, PayrollRunStatus } from "@/types/hrm";

export const PAYROLL_STATUSES: { id: PayrollRunStatus; label: string }[] = [
  { id: "draft", label: "Draft" },
  { id: "processing", label: "Processing" },
  { id: "completed", label: "Paid" },
  { id: "failed", label: "Failed" },
];

export const PAYROLL_PERIODS = ["May 2026", "Apr 2026", "Mar 2026", "Feb 2026"];

export const DEMO_COMPANY_PAYROLL = {
  name: "Stockology Securities",
  address: "Plot 14, Industrial Area, Bhopal, Madhya Pradesh 462046",
};

const RAHIM_SLIP_DETAIL: Omit<PayrollRunDetail, keyof PayrollRecord> = {
  designation: "Senior Engineer",
  pan: "AOXPK2001H",
  uan: "100400037037",
  bankAccountMasked: "XXXXXXXX3013",
  payableDays: 30,
  lopDays: 0,
  companyName: DEMO_COMPANY_PAYROLL.name,
  companyAddress: DEMO_COMPANY_PAYROLL.address,
  earningLines: [
    { label: "Basic Salary", amount: 85000, type: "earning" },
    { label: "House Rent Allowance", amount: 10625, type: "earning" },
    { label: "Conveyance Allowance", amount: 3400, type: "earning" },
    { label: "Medical Allowance", amount: 3400, type: "earning" },
    { label: "Special Allowance", amount: 3825, type: "earning" },
  ],
  deductionLines: [
    { label: "Provident Fund (PF)", amount: 4080, type: "deduction" },
    { label: "Professional Tax", amount: 200, type: "deduction" },
    { label: "Income Tax (TDS)", amount: 2520, type: "deduction" },
  ],
};

export const DEMO_HRM_PAYROLL_BATCH_RUNS: PayrollBatchRun[] = [
  {
    id: "pr_may_2026",
    runCode: "PR-2505",
    period: "May 2026",
    employeeCount: 1248,
    grossPay: 31250000,
    deductions: 2594460,
    netPay: 28655540,
    currency: "INR",
    status: "processing",
  },
  {
    id: "pr_apr_2026",
    runCode: "PR-2504",
    period: "Apr 2026",
    employeeCount: 1241,
    grossPay: 30890000,
    deductions: 2512000,
    netPay: 28378000,
    currency: "INR",
    status: "completed",
  },
  {
    id: "pr_mar_2026",
    runCode: "PR-2503",
    period: "Mar 2026",
    employeeCount: 1235,
    grossPay: 30540000,
    deductions: 2489000,
    netPay: 28051000,
    currency: "INR",
    status: "completed",
  },
];

export const DEMO_HRM_PAYROLL: PayrollRecord[] = [
  {
    id: "pay_1",
    payslipId: "PSL-2026-05-001",
    period: "May 2026",
    employeeName: "Rahim Uddin",
    employeeCode: "EMP-1001",
    department: "IT",
    location: "Mumbai, IN",
    basicPay: 85000,
    allowance: 21250,
    grossPay: 106250,
    deductions: 6800,
    netPay: 99450,
    currency: "INR",
    status: "completed",
    paidOn: "30 May 2026",
  },
  {
    id: "pay_2",
    payslipId: "PSL-2026-05-014",
    period: "May 2026",
    employeeName: "Sumaiya Akter",
    employeeCode: "EMP-1014",
    department: "HR",
    location: "Mumbai, IN",
    basicPay: 60000,
    allowance: 15000,
    grossPay: 75000,
    deductions: 4800,
    netPay: 70200,
    currency: "INR",
    status: "completed",
    paidOn: "30 May 2026",
  },
  {
    id: "pay_3",
    payslipId: "PSL-2026-05-022",
    period: "May 2026",
    employeeName: "Priya Mehta",
    employeeCode: "EMP-0022",
    department: "Executive",
    location: "Mumbai, IN",
    basicPay: 228000,
    allowance: 57000,
    grossPay: 285000,
    deductions: 42800,
    netPay: 242200,
    currency: "INR",
    status: "completed",
    paidOn: "30 May 2026",
  },
  {
    id: "pay_4",
    payslipId: "PSL-2026-05-008",
    period: "May 2026",
    employeeName: "Anil Yadav",
    employeeCode: "EMP-0008",
    department: "Revenue",
    location: "Mumbai, IN",
    basicPay: 116000,
    allowance: 29000,
    grossPay: 145000,
    deductions: 21800,
    netPay: 123200,
    currency: "INR",
    status: "processing",
  },
  {
    id: "pay_5",
    payslipId: "PSL-2026-05-031",
    period: "May 2026",
    employeeName: "Sarah Chen",
    employeeCode: "EMP-0031",
    department: "Human Resources",
    location: "Singapore",
    basicPay: 7840,
    allowance: 1960,
    grossPay: 9800,
    deductions: 1470,
    netPay: 8330,
    currency: "SGD",
    status: "processing",
  },
  {
    id: "pay_6",
    payslipId: "PSL-2026-05-045",
    period: "May 2026",
    employeeName: "Noah Patel",
    employeeCode: "EMP-0045",
    department: "Finance",
    location: "Mumbai, IN",
    basicPay: 57600,
    allowance: 14400,
    grossPay: 72000,
    deductions: 10800,
    netPay: 61200,
    currency: "INR",
    status: "draft",
  },
  {
    id: "pay_7",
    payslipId: "PSL-2026-04-019",
    period: "Apr 2026",
    employeeName: "Rahim Uddin",
    employeeCode: "EMP-1001",
    department: "IT",
    location: "Mumbai, IN",
    basicPay: 85000,
    allowance: 21250,
    grossPay: 106250,
    deductions: 6800,
    netPay: 99450,
    currency: "INR",
    status: "completed",
    paidOn: "30 Apr 2026",
  },
  {
    id: "pay_8",
    payslipId: "PSL-2026-04-038",
    period: "Apr 2026",
    employeeName: "David Kim",
    employeeCode: "EMP-0038",
    department: "Operations",
    location: "Singapore",
    basicPay: 8960,
    allowance: 2240,
    grossPay: 11200,
    deductions: 1680,
    netPay: 9520,
    currency: "SGD",
    status: "completed",
    paidOn: "30 Apr 2026",
  },
];

const PAYSLIP_DETAILS: Record<string, Omit<PayrollRunDetail, keyof PayrollRecord>> = {
  pay_1: {
    ...RAHIM_SLIP_DETAIL,
    payDate: "30 May 2026",
  },
  pay_7: {
    ...RAHIM_SLIP_DETAIL,
    payDate: "30 Apr 2026",
  },
  pay_2: {
    designation: "HR Executive",
    pan: "XYZSA5678G",
    uan: "100987654321",
    bankAccountMasked: "XXXXXX8821",
    payableDays: 30,
    lopDays: 0,
    payDate: "30 May 2026",
    companyName: DEMO_COMPANY_PAYROLL.name,
    companyAddress: DEMO_COMPANY_PAYROLL.address,
    earningLines: [
      { label: "Basic Salary", amount: 60000, type: "earning" },
      { label: "House Rent Allowance", amount: 9000, type: "earning" },
      { label: "Conveyance Allowance", amount: 2500, type: "earning" },
      { label: "Medical Allowance", amount: 1500, type: "earning" },
      { label: "Special Allowance", amount: 2000, type: "earning" },
    ],
    deductionLines: [
      { label: "Provident Fund (PF)", amount: 3000, type: "deduction" },
      { label: "Professional Tax", amount: 200, type: "deduction" },
      { label: "Income Tax (TDS)", amount: 1600, type: "deduction" },
    ],
  },
};

function defaultPayslipDetail(record: PayrollRecord): Omit<PayrollRunDetail, keyof PayrollRecord> {
  const structure = DEMO_EMPLOYEE_SALARY_STRUCTURES[record.employeeCode];
  const lines = structure
    ? buildPayslipLines(DEFAULT_PAYROLL_SALARY_COMPONENTS, structure)
    : null;
  const basic = record.basicPay ?? Math.round(record.grossPay * 0.8);
  const allowance = record.allowance ?? record.grossPay - basic;

  return {
    designation: "Team Member",
    pan: "XXXXX0000X",
    uan: "100000000000",
    bankAccountMasked: "XXXXXX0000",
    payableDays: 30,
    lopDays: 0,
    payDate: record.paidOn ?? "30 May 2026",
    companyName: DEMO_COMPANY_PAYROLL.name,
    companyAddress: DEMO_COMPANY_PAYROLL.address,
    earningLines: lines?.earningLines ?? [
      { label: "Basic Salary", amount: basic, type: "earning" },
      { label: "Allowances", amount: allowance, type: "earning" },
    ],
    deductionLines: lines?.deductionLines ?? [
      { label: "Provident Fund (PF)", amount: Math.round(record.deductions * 0.6), type: "deduction" },
      { label: "Professional Tax", amount: 200, type: "deduction" },
      { label: "Income Tax (TDS)", amount: Math.max(0, record.deductions - Math.round(record.deductions * 0.6) - 200), type: "deduction" },
    ],
  };
}

export function getDemoPayslipDetail(record: PayrollRecord): PayrollRunDetail {
  const extra = PAYSLIP_DETAILS[record.id] ?? defaultPayslipDetail(record);
  const structure = DEMO_EMPLOYEE_SALARY_STRUCTURES[record.employeeCode];
  const fromStructure = structure ? buildPayslipLines(DEFAULT_PAYROLL_SALARY_COMPONENTS, structure) : null;
  return {
    ...record,
    ...extra,
    grossPay: fromStructure?.grossPay ?? record.grossPay,
    deductions: fromStructure?.deductions ?? record.deductions,
    netPay: fromStructure?.netPay ?? record.netPay,
    earningLines: extra.earningLines ?? fromStructure?.earningLines,
    deductionLines: extra.deductionLines ?? fromStructure?.deductionLines,
  };
}

export function formatPayrollAmount(amount: number, currency: string) {
  const locales: Record<string, string> = {
    INR: "en-IN",
    GBP: "en-GB",
    EUR: "de-DE",
    SGD: "en-SG",
    AED: "en-AE",
  };
  return new Intl.NumberFormat(locales[currency] ?? "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPayrollInrCompact(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function computePayrollSummary(records: PayrollRecord[]) {
  const inrRecords = records.filter((r) => r.currency === "INR");
  const paid = inrRecords.filter((r) => r.status === "completed");
  const monthlyCost = inrRecords.reduce((sum, r) => sum + r.netPay, 0);
  const totalDeductions = inrRecords.reduce((sum, r) => sum + r.deductions, 0);
  const employeesPaid = paid.length;
  const avgNet = employeesPaid > 0 ? Math.round(paid.reduce((s, r) => s + r.netPay, 0) / employeesPaid) : 0;

  return {
    monthlyCost,
    employeesPaid,
    totalDeductions,
    avgNet,
    processingCount: records.filter((r) => r.status === "processing").length,
    draftCount: records.filter((r) => r.status === "draft").length,
  };
}

/** Derive batch-run rows from payslip lines returned by GET /payroll/runs. */
export function aggregatePayrollBatchRuns(records: PayrollRecord[]): PayrollBatchRun[] {
  const byPeriod = new Map<string, PayrollRecord[]>();
  for (const record of records) {
    const bucket = byPeriod.get(record.period) ?? [];
    bucket.push(record);
    byPeriod.set(record.period, bucket);
  }

  const resolveStatus = (items: PayrollRecord[]): PayrollRunStatus => {
    if (items.some((i) => i.status === "processing")) return "processing";
    if (items.some((i) => i.status === "failed")) return "failed";
    if (items.every((i) => i.status === "completed")) return "completed";
    if (items.some((i) => i.status === "draft")) return "draft";
    return "completed";
  };

  return [...byPeriod.entries()]
    .map(([period, items]) => {
      const grossPay = items.reduce((s, i) => s + i.grossPay, 0);
      const deductions = items.reduce((s, i) => s + i.deductions, 0);
      const netPay = items.reduce((s, i) => s + i.netPay, 0);
      const [monthLabel, yearLabel] = period.split(" ");
      const runSuffix = `${yearLabel?.slice(-2) ?? "00"}${String(new Date(`${monthLabel} 1, ${yearLabel}`).getMonth() + 1).padStart(2, "0")}`;

      return {
        id: `pr_${period.replace(/\s+/g, "_").toLowerCase()}`,
        runCode: `PR-${runSuffix}`,
        period,
        employeeCount: items.length,
        grossPay,
        deductions,
        netPay,
        currency: items[0]?.currency ?? "INR",
        status: resolveStatus(items),
      } satisfies PayrollBatchRun;
    })
    .sort((a, b) => b.period.localeCompare(a.period));
}
