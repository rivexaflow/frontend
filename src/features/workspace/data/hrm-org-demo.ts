export type HrmEmployee = {
  id: string;
  name: string;
  designation: string;
  department: string;
  managerId: string | null;
  email?: string;
  /** Shown in card header (branch / unit name). */
  unitLabel?: string;
  /** Vacant role — shows “No head assigned” banner. */
  vacant?: boolean;
  starred?: boolean;
};

export const DEMO_HRM_EMPLOYEES: HrmEmployee[] = [
  {
    id: "emp_root",
    name: "Priya Mehta",
    designation: "Administrator",
    department: "Executive",
    managerId: null,
    email: "priya.mehta@acme.com",
    unitLabel: "Executive Office",
    starred: true,
  },
  {
    id: "emp_1",
    name: "Anil Yadav",
    designation: "Head of Sales",
    department: "Revenue",
    managerId: "emp_root",
    email: "anil.yadav@acme.com",
    unitLabel: "Revenue · APAC",
  },
  {
    id: "emp_2",
    name: "Marcus Webb",
    designation: "Head of Compliance",
    department: "Compliance",
    managerId: "emp_root",
    email: "marcus.webb@acme.com",
    unitLabel: "Compliance Hub",
  },
  {
    id: "emp_3",
    name: "Sarah Chen",
    designation: "HR Manager",
    department: "Human Resources",
    managerId: "emp_root",
    email: "sarah.chen@acme.com",
    unitLabel: "People Operations",
  },
  {
    id: "emp_4",
    name: "Elena Rossi",
    designation: "Deal Executive",
    department: "Revenue",
    managerId: "emp_1",
    email: "elena.rossi@acme.com",
  },
  {
    id: "emp_5",
    name: "James Okonkwo",
    designation: "KYC Executive",
    department: "Compliance",
    managerId: "emp_2",
    email: "james.okonkwo@acme.com",
  },
  {
    id: "emp_6",
    name: "Amira Hassan",
    designation: "Sales Executive",
    department: "Revenue",
    managerId: "emp_1",
    email: "amira.hassan@acme.com",
  },
  {
    id: "emp_7",
    name: "Noah Patel",
    designation: "Payroll Specialist",
    department: "Human Resources",
    managerId: "emp_3",
    email: "noah.patel@acme.com",
  },
];

export function employeesByManager(
  employees: HrmEmployee[],
  managerId: string | null,
): HrmEmployee[] {
  return employees.filter((e) => e.managerId === managerId);
}

export function getEmployee(employees: HrmEmployee[], id: string): HrmEmployee | undefined {
  return employees.find((e) => e.id === id);
}

/** Prevent assigning a manager that would create a cycle. */
export function wouldCreateCycle(
  employees: HrmEmployee[],
  employeeId: string,
  newManagerId: string,
): boolean {
  let current: string | null = newManagerId;
  while (current) {
    if (current === employeeId) return true;
    current = getEmployee(employees, current)?.managerId ?? null;
  }
  return false;
}

/** Direct + indirect reports. */
export function countReports(employees: HrmEmployee[], managerId: string): number {
  const direct = employeesByManager(employees, managerId);
  return direct.reduce((sum, child) => sum + 1 + countReports(employees, child.id), 0);
}

export function createSubordinate(
  employees: HrmEmployee[],
  managerId: string,
): HrmEmployee {
  const manager = getEmployee(employees, managerId);
  return {
    id: `emp_${Date.now()}`,
    name: "New team member",
    designation: "Manager",
    department: manager?.department ?? "General",
    managerId,
    unitLabel: "New unit",
    vacant: true,
  };
}
