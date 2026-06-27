import type {
  HrmEmployeeSalaryComponentAmount,
  PayrollLineItem,
  PayrollSalaryComponent,
} from "@/types/hrm";

export const DEFAULT_PAYROLL_SALARY_COMPONENTS: PayrollSalaryComponent[] = [
  { id: "basic", code: "BASIC", label: "Basic Salary", type: "earning", enabled: true, sortOrder: 1 },
  { id: "hra", code: "HRA", label: "House Rent Allowance", type: "earning", enabled: true, sortOrder: 2 },
  { id: "conveyance", code: "CONV", label: "Conveyance Allowance", type: "earning", enabled: true, sortOrder: 3 },
  { id: "medical", code: "MED", label: "Medical Allowance", type: "earning", enabled: true, sortOrder: 4 },
  { id: "special", code: "SPL", label: "Special Allowance", type: "earning", enabled: true, sortOrder: 5 },
  { id: "pf", code: "PF", label: "Provident Fund (PF)", type: "deduction", enabled: true, sortOrder: 6, isStatutory: true },
  { id: "professional_tax", code: "PT", label: "Professional Tax", type: "deduction", enabled: true, sortOrder: 7, isStatutory: true },
  { id: "tds", code: "TDS", label: "Income Tax (TDS)", type: "deduction", enabled: true, sortOrder: 8, isStatutory: true },
];

/** Demo per-employee monthly structure — HR sets these on the employee payroll profile. */
export const DEMO_EMPLOYEE_SALARY_STRUCTURES: Record<string, HrmEmployeeSalaryComponentAmount[]> = {
  "EMP-1001": [
    { componentId: "basic", amount: 85000 },
    { componentId: "hra", amount: 10625 },
    { componentId: "conveyance", amount: 3400 },
    { componentId: "medical", amount: 3400 },
    { componentId: "special", amount: 3825 },
    { componentId: "pf", amount: 4080 },
    { componentId: "professional_tax", amount: 200 },
    { componentId: "tds", amount: 2520 },
  ],
  "EMP-1014": [
    { componentId: "basic", amount: 60000 },
    { componentId: "hra", amount: 9000 },
    { componentId: "conveyance", amount: 2500 },
    { componentId: "medical", amount: 1500 },
    { componentId: "special", amount: 2000 },
    { componentId: "pf", amount: 3000 },
    { componentId: "professional_tax", amount: 200 },
    { componentId: "tds", amount: 1600 },
  ],
};

export function buildPayslipLines(
  components: PayrollSalaryComponent[],
  amounts: HrmEmployeeSalaryComponentAmount[],
): { earningLines: PayrollLineItem[]; deductionLines: PayrollLineItem[]; grossPay: number; deductions: number; netPay: number } {
  const amountMap = new Map(amounts.map((a) => [a.componentId, a.amount]));
  const enabled = [...components].filter((c) => c.enabled).sort((a, b) => a.sortOrder - b.sortOrder);

  const earningLines: PayrollLineItem[] = [];
  const deductionLines: PayrollLineItem[] = [];

  for (const component of enabled) {
    const amount = amountMap.get(component.id) ?? 0;
    if (amount <= 0) continue;
    const line: PayrollLineItem = { label: component.label, amount, type: component.type };
    if (component.type === "earning") earningLines.push(line);
    else deductionLines.push(line);
  }

  const grossPay = earningLines.reduce((s, l) => s + l.amount, 0);
  const deductions = deductionLines.reduce((s, l) => s + l.amount, 0);

  return { earningLines, deductionLines, grossPay, deductions, netPay: grossPay - deductions };
}

export function summarizeSalaryStructure(
  components: PayrollSalaryComponent[],
  amounts: HrmEmployeeSalaryComponentAmount[],
) {
  const { earningLines, deductionLines, grossPay, deductions, netPay } = buildPayslipLines(components, amounts);
  return { earningLines, deductionLines, grossPay, deductions, netPay };
}
