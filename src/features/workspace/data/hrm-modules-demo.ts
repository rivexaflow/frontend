export type HrmAssetRecord = {
  id: string;
  name: string;
  tag: string;
  category: string;
  custodian: string;
  custodianRole: string;
  department: string;
  serial: string;
  value: number;
  currency: string;
  condition: "Good" | "Fair" | "Poor";
  location: string;
  status: "assigned" | "available" | "repair";
  custodyRisk: "Low" | "Medium" | "High";
  issuedAt: string;
  warrantyUntil?: string;
  imageUrl?: string;
  vendor?: string;
  purchaseDate?: string;
  specs?: string[];
  notes?: string;
};

export const DEMO_HRM_ASSETS: HrmAssetRecord[] = [
  {
    id: "a1",
    name: 'MacBook Pro 14"',
    tag: "AST-1001",
    category: "Laptop",
    custodian: "Priya Mehta",
    custodianRole: "CEO",
    department: "Executive",
    serial: "C02X-9921",
    value: 250000,
    currency: "INR",
    condition: "Good",
    location: "Mumbai HQ",
    status: "assigned",
    custodyRisk: "Medium",
    issuedAt: "Jan 2024",
    warrantyUntil: "Jan 2027",
    vendor: "Apple Authorized Reseller",
    purchaseDate: "Dec 2023",
    specs: ["Apple M3 Pro", "16 GB RAM", "512 GB SSD", "macOS Sonoma"],
    notes: "Primary executive device · FileVault enabled",
  },
  {
    id: "a2",
    name: "iPhone 15 Pro",
    tag: "AST-1002",
    category: "Phone",
    custodian: "Rahul Verma",
    custodianRole: "Sales Manager",
    department: "Sales",
    serial: "IMEI-8821",
    value: 145000,
    currency: "INR",
    condition: "Good",
    location: "Delhi",
    status: "assigned",
    custodyRisk: "Medium",
    issuedAt: "Mar 2025",
    vendor: "Reliance Digital",
    purchaseDate: "Feb 2025",
    specs: ["256 GB", "Natural Titanium", "Corporate MDM enrolled"],
  },
  {
    id: "a3",
    name: 'Dell UltraSharp 27"',
    tag: "AST-1003",
    category: "Monitor",
    custodian: "Anita Desai",
    custodianRole: "HR Executive",
    department: "HR",
    serial: "DL-44102",
    value: 42000,
    currency: "INR",
    condition: "Good",
    location: "Mumbai HQ",
    status: "assigned",
    custodyRisk: "Low",
    issuedAt: "Aug 2024",
    warrantyUntil: "Aug 2027",
    vendor: "Dell India",
    purchaseDate: "Jul 2024",
    specs: ['27" 4K IPS', "USB-C hub", "Height-adjust stand"],
  },
  {
    id: "a4",
    name: "Logitech MX Keys",
    tag: "AST-1004",
    category: "Accessory",
    custodian: "—",
    custodianRole: "—",
    department: "—",
    serial: "LG-99201",
    value: 8500,
    currency: "INR",
    condition: "Good",
    location: "Mumbai HQ",
    status: "available",
    custodyRisk: "Low",
    issuedAt: "—",
    vendor: "Amazon Business",
    purchaseDate: "May 2025",
    specs: ["Wireless", "Backlit", "Multi-device pairing"],
    notes: "Spare pool · assign on request",
  },
  {
    id: "a5",
    name: "HP EliteBook 840",
    tag: "AST-1005",
    category: "Laptop",
    custodian: "—",
    custodianRole: "—",
    department: "IT",
    serial: "HP-7721",
    value: 98000,
    currency: "INR",
    condition: "Fair",
    location: "Service center",
    status: "repair",
    custodyRisk: "Low",
    issuedAt: "Feb 2023",
    warrantyUntil: "Feb 2026",
    vendor: "HP Enterprise",
    purchaseDate: "Jan 2023",
    specs: ["Intel i7", "16 GB RAM", "512 GB SSD"],
    notes: "Keyboard replacement pending · ETA 3 days",
  },
];

export type HrmRecruitmentJob = {
  id: string;
  title: string;
  department: string;
  openings: number;
  applicants: number;
  stage: "draft" | "published" | "closed";
  postedAt: string;
};

export const DEMO_HRM_JOBS: HrmRecruitmentJob[] = [
  { id: "j1", title: "Senior Frontend Engineer", department: "Engineering", openings: 2, applicants: 34, stage: "published", postedAt: "Jun 1, 2026" },
  { id: "j2", title: "Sales Executive", department: "Sales", openings: 5, applicants: 18, stage: "published", postedAt: "May 28, 2026" },
  { id: "j3", title: "HR Business Partner", department: "HR", openings: 1, applicants: 9, stage: "draft", postedAt: "—" },
];

export type HrmGrievanceTicket = {
  id: string;
  subject: string;
  employee: string;
  department: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_review" | "resolved";
  filedAt: string;
};

export const DEMO_HRM_GRIEVANCES: HrmGrievanceTicket[] = [
  { id: "G-101", subject: "Shift timing clarification", employee: "Karan Patel", department: "Operations", priority: "medium", status: "in_review", filedAt: "Jun 14, 2026" },
  { id: "G-102", subject: "Workspace seating request", employee: "Neha Singh", department: "Marketing", priority: "low", status: "open", filedAt: "Jun 15, 2026" },
];

export type HrmLoanRecord = {
  id: string;
  employee: string;
  type: "Salary advance" | "Personal loan";
  amount: number;
  currency: string;
  status: "pending" | "approved" | "repaying" | "closed";
  requestedAt: string;
};

export const DEMO_HRM_LOANS: HrmLoanRecord[] = [
  { id: "L-01", employee: "Amit Shah", type: "Salary advance", amount: 50000, currency: "INR", status: "approved", requestedAt: "Jun 10, 2026" },
  { id: "L-02", employee: "Sneha Rao", type: "Personal loan", amount: 200000, currency: "INR", status: "repaying", requestedAt: "Apr 2, 2026" },
];

export type HrmActivityLog = {
  id: string;
  action: string;
  module: string;
  actor: string;
  occurredAt: string;
  detail?: string;
};

export const DEMO_HRM_ACTIVITY: HrmActivityLog[] = [
  { id: "1", action: "Employee created", module: "Employees", actor: "HR Admin", occurredAt: "2 hours ago", detail: "EMP-012 · Alex Morgan" },
  { id: "2", action: "Leave approved", module: "Leave", actor: "Manager", occurredAt: "5 hours ago", detail: "Annual leave · 3 days" },
  { id: "3", action: "Payroll run started", module: "Payroll", actor: "Finance", occurredAt: "Yesterday", detail: "May 2026 cycle" },
  { id: "4", action: "Role permissions updated", module: "Settings", actor: "Super Admin", occurredAt: "2 days ago", detail: "Manager role · +3 permissions" },
];
