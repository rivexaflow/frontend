import type { WorkspaceModuleId } from "./workspace-user-modules";
import type { WorkspaceProfileRole, WorkspaceUserStatus } from "./workspace-user-roles";

export type WorkspaceUserRecord = {
  id: string;
  name: string;
  email: string;
  profileRole: WorkspaceProfileRole;
  status: WorkspaceUserStatus;
  lastActive: string;
  department: string;
  team?: string;
  modules: WorkspaceModuleId[];
  joinedAt: string;
  mfaEnabled?: boolean;
  mobile?: string;
};

export const DEMO_WORKSPACE_USERS: WorkspaceUserRecord[] = [
  {
    id: "u1",
    name: "Anil Yadav",
    email: "anil.yadav@acme.com",
    profileRole: "Senior Sales Executive",
    status: "active",
    lastActive: "2 min ago",
    department: "Revenue",
    team: "APAC Enterprise",
    modules: ["crm", "deals"],
    joinedAt: "Mar 2024",
    mfaEnabled: true,
  },
  {
    id: "u2",
    name: "Priya Mehta",
    email: "priya.mehta@acme.com",
    profileRole: "Sales Executive",
    status: "active",
    lastActive: "18 min ago",
    department: "Revenue",
    team: "EMEA Growth",
    modules: ["crm", "deals"],
    joinedAt: "Jan 2025",
    mfaEnabled: true,
  },
  {
    id: "u3",
    name: "James Okonkwo",
    email: "james.okonkwo@acme.com",
    profileRole: "KYC Executive",
    status: "active",
    lastActive: "1 hr ago",
    department: "Compliance",
    team: "Verification",
    modules: ["kyc"],
    joinedAt: "Aug 2023",
    mfaEnabled: true,
  },
  {
    id: "u4",
    name: "Elena Rossi",
    email: "elena.rossi@acme.com",
    profileRole: "Deal Executive",
    status: "active",
    lastActive: "3 hr ago",
    department: "Revenue",
    modules: ["crm", "deals", "billing"],
    joinedAt: "Jun 2024",
  },
  {
    id: "u5",
    name: "Sarah Chen",
    email: "sarah.chen@acme.com",
    profileRole: "HR Manager",
    status: "active",
    lastActive: "Today",
    department: "People",
    modules: ["hrm"],
    joinedAt: "Feb 2022",
    mfaEnabled: true,
  },
  {
    id: "u6",
    name: "Marcus Webb",
    email: "marcus.webb@acme.com",
    profileRole: "Compliance Officer",
    status: "active",
    lastActive: "Yesterday",
    department: "Compliance",
    modules: ["kyc", "crm"],
    joinedAt: "Nov 2021",
    mfaEnabled: true,
  },
  {
    id: "u7",
    name: "Noah Patel",
    email: "noah.patel@acme.com",
    profileRole: "Finance Executive",
    status: "invited",
    lastActive: "—",
    department: "Finance",
    modules: ["billing"],
    joinedAt: "Pending",
  },
  {
    id: "u8",
    name: "Amira Hassan",
    email: "amira.hassan@acme.com",
    profileRole: "Customer Success Manager",
    status: "active",
    lastActive: "4 hr ago",
    department: "Success",
    modules: ["crm"],
    joinedAt: "Sep 2024",
  },
  {
    id: "u9",
    name: "Tomás Rivera",
    email: "tomas.rivera@acme.com",
    profileRole: "Operations Manager",
    status: "suspended",
    lastActive: "5 days ago",
    department: "Operations",
    modules: ["crm", "billing"],
    joinedAt: "Apr 2023",
  },
  {
    id: "u10",
    name: "Lisa Park",
    email: "lisa.park@acme.com",
    profileRole: "Data Analyst",
    status: "active",
    lastActive: "30 min ago",
    department: "Intelligence",
    modules: ["ai", "crm"],
    joinedAt: "Jul 2024",
    mfaEnabled: true,
  },
  {
    id: "u11",
    name: "David Kim",
    email: "david.kim@acme.com",
    profileRole: "Support Specialist",
    status: "locked",
    lastActive: "2 weeks ago",
    department: "Support",
    modules: ["crm"],
    joinedAt: "Dec 2020",
  },
];
