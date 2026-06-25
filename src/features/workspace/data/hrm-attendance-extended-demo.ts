export type AttendanceBreakSession = {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation?: string;
  breakStartedAt: string;
  breakType: "Lunch" | "Tea" | "Personal";
  maxMinutes: number;
};

export type AttendanceRegularizationRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  requestedCheckIn: string;
  requestedCheckOut: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
};

export type RosterShift = {
  id: string;
  label: string;
  start: string;
  end: string;
};

export type RosterRow = {
  employeeId: string;
  employeeName: string;
  department: string;
  shifts: Record<string, RosterShift | null>;
};

export const ROSTER_WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const DEMO_BREAK_SESSIONS: AttendanceBreakSession[] = [
  {
    id: "brk-1",
    employeeId: "demo-1",
    employeeName: "Priya Sharma",
    department: "Engineering",
    designation: "Senior Developer",
    breakStartedAt: "12:42",
    breakType: "Lunch",
    maxMinutes: 45,
  },
  {
    id: "brk-2",
    employeeId: "demo-2",
    employeeName: "Rahul Mehta",
    department: "Sales",
    designation: "Account Executive",
    breakStartedAt: "15:08",
    breakType: "Tea",
    maxMinutes: 15,
  },
  {
    id: "brk-3",
    employeeId: "demo-3",
    employeeName: "Anita Desai",
    department: "Operations",
    designation: "Team Lead",
    breakStartedAt: "13:15",
    breakType: "Lunch",
    maxMinutes: 45,
  },
];

export const DEMO_REGULARIZATION_REQUESTS: AttendanceRegularizationRequest[] = [
  {
    id: "reg-1",
    employeeId: "demo-4",
    employeeName: "Vikram Singh",
    department: "Engineering",
    date: "2026-06-18",
    requestedCheckIn: "09:12",
    requestedCheckOut: "18:05",
    reason: "Client call ran over — missed clock-in reminder.",
    status: "pending",
    submittedAt: "2026-06-18T18:30:00",
  },
  {
    id: "reg-2",
    employeeId: "demo-5",
    employeeName: "Sneha Patel",
    department: "HR",
    date: "2026-06-17",
    requestedCheckIn: "08:55",
    requestedCheckOut: "17:45",
    reason: "Biometric reader was offline at lobby.",
    status: "pending",
    submittedAt: "2026-06-17T09:10:00",
  },
  {
    id: "reg-3",
    employeeId: "demo-6",
    employeeName: "Arjun Nair",
    department: "Finance",
    date: "2026-06-16",
    requestedCheckIn: "10:00",
    requestedCheckOut: "19:00",
    reason: "Approved WFH — forgot to mark remote check-in.",
    status: "approved",
    submittedAt: "2026-06-16T11:00:00",
  },
  {
    id: "reg-4",
    employeeId: "demo-7",
    employeeName: "Kavya Reddy",
    department: "Marketing",
    date: "2026-06-15",
    requestedCheckIn: "09:30",
    requestedCheckOut: "18:30",
    reason: "Late arrival without prior notice.",
    status: "rejected",
    submittedAt: "2026-06-15T10:00:00",
  },
];

export function buildDemoRosterRows(names: { id: string; name: string; department: string }[]): RosterRow[] {
  const shiftPatterns: (RosterShift | null)[][] = [
    [
      { id: "s1", label: "General", start: "09:00", end: "18:00" },
      { id: "s1", label: "General", start: "09:00", end: "18:00" },
      { id: "s1", label: "General", start: "09:00", end: "18:00" },
      { id: "s1", label: "General", start: "09:00", end: "18:00" },
      { id: "s1", label: "General", start: "09:00", end: "18:00" },
      null,
      null,
    ],
    [
      { id: "s2", label: "Morning", start: "07:00", end: "15:00" },
      { id: "s2", label: "Morning", start: "07:00", end: "15:00" },
      { id: "s2", label: "Morning", start: "07:00", end: "15:00" },
      { id: "s2", label: "Morning", start: "07:00", end: "15:00" },
      { id: "s2", label: "Morning", start: "07:00", end: "15:00" },
      { id: "s2", label: "Morning", start: "07:00", end: "15:00" },
      null,
    ],
    [
      { id: "s3", label: "Evening", start: "14:00", end: "22:00" },
      null,
      { id: "s3", label: "Evening", start: "14:00", end: "22:00" },
      null,
      { id: "s3", label: "Evening", start: "14:00", end: "22:00" },
      { id: "s3", label: "Evening", start: "14:00", end: "22:00" },
      { id: "s3", label: "Evening", start: "14:00", end: "22:00" },
    ],
  ];

  return names.slice(0, 8).map((emp, index) => {
    const pattern = shiftPatterns[index % shiftPatterns.length];
    const shifts = Object.fromEntries(
      ROSTER_WEEK_DAYS.map((day, dayIndex) => [day, pattern[dayIndex] ?? null]),
    ) as Record<string, RosterShift | null>;
    return {
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      shifts,
    };
  });
}
