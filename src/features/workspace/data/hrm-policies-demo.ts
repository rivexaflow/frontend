import type {
  HrmPolicyCategory,
  HrmPolicyRecord,
  HrmPolicySection,
  HrmPolicyStatus,
} from "@/types/hrm";

export type { HrmPolicyCategory, HrmPolicyRecord, HrmPolicySection, HrmPolicyStatus } from "@/types/hrm";

export const HRM_POLICY_CATEGORIES: { id: HrmPolicyCategory; label: string }[] = [
  { id: "hr", label: "HR & employment" },
  { id: "leave", label: "Leave & attendance" },
  { id: "conduct", label: "Code of conduct" },
  { id: "safety", label: "Health & safety" },
  { id: "it", label: "IT & data" },
  { id: "benefits", label: "Benefits" },
];

export const HRM_POLICY_STATUSES: { id: HrmPolicyStatus; label: string }[] = [
  { id: "draft", label: "Draft" },
  { id: "published", label: "Published" },
  { id: "archived", label: "Archived" },
];

export const DEMO_HRM_POLICIES: HrmPolicyRecord[] = [
  {
    id: "pol_1",
    title: "Remote & Hybrid Work Policy",
    category: "hr",
    status: "published",
    version: "3.1",
    effectiveFrom: "Jan 1, 2026",
    publishedAt: "Dec 15, 2025",
    owner: "Sarah Chen",
    summary: "Eligibility, core hours, equipment stipend, and security requirements for remote work.",
    acknowledgmentRequired: true,
    acknowledgedCount: 118,
    totalEmployees: 124,
    lastUpdated: "Dec 15, 2025",
    tags: ["remote", "hybrid", "global"],
    sections: [
      {
        id: "s1",
        heading: "1. Purpose & scope",
        body: "This policy defines eligibility, expectations, and security requirements for employees working remotely or in a hybrid arrangement across all Rivexaflow entities. It applies to full-time, part-time, and contract employees unless otherwise stated in their employment agreement.",
      },
      {
        id: "s2",
        heading: "2. Eligibility",
        body: "Remote or hybrid work may be granted based on role suitability, performance history, and business needs. Managers must approve arrangements in writing. Roles requiring on-site presence (facilities, lab, front-desk) are excluded unless an exception is approved by HR and the department head.",
      },
      {
        id: "s3",
        heading: "3. Core collaboration hours",
        body: "Employees must be available during core hours 10:00–16:00 in their assigned timezone (default: Asia/Kolkata for India entities). Meetings outside core hours require 24-hour notice where possible. Cross-border teams should align on a 4-hour overlap window documented in the team charter.",
      },
      {
        id: "s4",
        heading: "4. Equipment & stipend",
        body: "The company provides a one-time home-office stipend of ₹15,000 (or local equivalent) for eligible remote employees. Equipment remains company property where issued. Employees are responsible for maintaining a safe, ergonomic workspace and stable internet connectivity (minimum 50 Mbps recommended).",
      },
      {
        id: "s5",
        heading: "5. Data security",
        body: "All company data must be accessed via approved VPN and MDM-enrolled devices. Personal devices may not store customer PII. Screen locks, disk encryption, and automatic updates are mandatory. Report lost devices to IT Security within 2 hours.",
      },
      {
        id: "s6",
        heading: "6. Review & exceptions",
        body: "Arrangements are reviewed annually or upon role change. HR may revoke remote privileges for performance, attendance, or security violations. Exceptions require written approval from HR Director and are valid for 90 days unless renewed.",
      },
    ],
  },
  {
    id: "pol_2",
    title: "Annual Leave & Encashment",
    category: "leave",
    status: "published",
    version: "2.0",
    effectiveFrom: "Apr 1, 2026",
    publishedAt: "Mar 20, 2026",
    owner: "HR Team",
    summary: "Accrual rules, carry-forward limits, encashment on exit, and approval workflow.",
    acknowledgmentRequired: true,
    acknowledgedCount: 96,
    totalEmployees: 124,
    lastUpdated: "Mar 20, 2026",
    tags: ["leave", "accrual", "payroll"],
    sections: [
      {
        id: "s1",
        heading: "1. Leave types",
        body: "Annual leave (18 days), sick leave (12 days), and optional unpaid leave are tracked in the HRM module. Public holidays follow the published regional calendar. Maternity, paternity, and bereavement leave are governed by separate addenda.",
      },
      {
        id: "s2",
        heading: "2. Accrual & probation",
        body: "Leave accrues monthly from the first full month after joining. Employees on probation accrue leave but may take a maximum of 5 days before confirmation. Accrual stops during unpaid suspension.",
      },
      {
        id: "s3",
        heading: "3. Carry-forward",
        body: "Up to 5 unused annual leave days may be carried forward to the next fiscal year. Carry-forward must be consumed by March 31 or it lapses unless an exception is approved by HR for business-critical roles.",
      },
      {
        id: "s4",
        heading: "4. Approval workflow",
        body: "Leave requests require manager approval in the system. Requests exceeding 5 consecutive days need department head approval. HR is notified automatically for leave spanning a salary month boundary.",
      },
      {
        id: "s5",
        heading: "5. Encashment on exit",
        body: "On resignation or termination, unused accrued annual leave is encashed at basic salary rate, subject to statutory caps. Encashment is processed in the final payroll run. No encashment applies during probation if employment ends for cause.",
      },
    ],
  },
  {
    id: "pol_3",
    title: "Anti-Harassment & POSH",
    category: "conduct",
    status: "published",
    version: "1.4",
    effectiveFrom: "Jan 1, 2025",
    publishedAt: "Dec 1, 2024",
    owner: "Compliance",
    summary: "Reporting channels, investigation process, and disciplinary actions.",
    acknowledgmentRequired: true,
    acknowledgedCount: 124,
    totalEmployees: 124,
    lastUpdated: "Dec 1, 2024",
    tags: ["posh", "compliance", "mandatory"],
    sections: [
      {
        id: "s1",
        heading: "1. Policy statement",
        body: "Rivexaflow maintains a zero-tolerance stance toward harassment, discrimination, and retaliation. All employees, contractors, and visitors must uphold respectful workplace conduct aligned with applicable labour and POSH regulations.",
      },
      {
        id: "s2",
        heading: "2. Definitions",
        body: "Harassment includes unwelcome conduct based on gender, race, religion, disability, or other protected characteristics that creates a hostile environment. Sexual harassment is defined per the POSH Act and includes quid pro quo and hostile environment cases.",
      },
      {
        id: "s3",
        heading: "3. Reporting channels",
        body: "Reports may be filed with any manager, HR, the Internal Committee (IC), or the anonymous ethics hotline. HR must acknowledge receipt within 48 hours. Retaliation against complainants is grounds for immediate termination.",
      },
      {
        id: "s4",
        heading: "4. Investigation process",
        body: "The IC initiates investigation within 7 days. Interim measures (transfer, leave) may apply. Findings are documented within 90 days. Both parties may present evidence. Outcomes are communicated in writing with appeal rights within 14 days.",
      },
      {
        id: "s5",
        heading: "5. Disciplinary actions",
        body: "Substantiated violations may result in warning, suspension, termination, or legal referral. False complaints made in bad faith may also result in discipline. All cases are logged in the compliance register for audit.",
      },
    ],
  },
  {
    id: "pol_4",
    title: "BYOD & Device Security",
    category: "it",
    status: "draft",
    version: "0.9",
    effectiveFrom: "Jul 1, 2026",
    owner: "IT Security",
    summary: "MDM enrollment, approved apps, and incident response for personal devices.",
    acknowledgmentRequired: true,
    acknowledgedCount: 0,
    totalEmployees: 124,
    lastUpdated: "May 18, 2026",
    tags: ["it", "security", "draft"],
    sections: [
      {
        id: "s1",
        heading: "1. Overview",
        body: "Bring-your-own-device (BYOD) is permitted only for roles approved by IT Security. Personal devices accessing company email or SaaS tools must enroll in mobile device management (MDM).",
      },
      {
        id: "s2",
        heading: "2. Approved applications",
        body: "Only applications on the IT allow-list may access company data. Jailbroken or rooted devices are prohibited. Cloud storage must use company-approved providers with SSO.",
      },
      {
        id: "s3",
        heading: "3. Incident response",
        body: "Suspected compromise must be reported within 1 hour. IT may remotely wipe company data from enrolled devices. Employees must cooperate with forensic review for critical incidents.",
      },
    ],
  },
  {
    id: "pol_5",
    title: "Health Insurance & Benefits",
    category: "benefits",
    status: "archived",
    version: "1.0",
    effectiveFrom: "Apr 1, 2024",
    publishedAt: "Mar 1, 2024",
    owner: "HR Team",
    summary: "Superseded by 2026 benefits pack. Retained for audit reference.",
    acknowledgmentRequired: false,
    acknowledgedCount: 110,
    totalEmployees: 118,
    lastUpdated: "Mar 1, 2024",
    tags: ["benefits", "archived"],
    sections: [
      {
        id: "s1",
        heading: "1. Coverage (archived)",
        body: "This 2024 benefits pack covered group medical insurance, dental, and vision for employees and dependents. It has been superseded by the 2026 benefits policy effective April 1, 2026.",
      },
    ],
  },
];
