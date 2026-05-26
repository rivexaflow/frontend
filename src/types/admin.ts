import type { Role } from "@/types/auth";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING";

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  status: UserStatus;
  companyId?: string;
  companyName?: string;
  createdAt: string;
  lastLoginAt?: string;
};

export type AdminCompany = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  region: string;
  memberCount: number;
  status: "ACTIVE" | "TRIAL" | "SUSPENDED";
  createdAt: string;
};

export type AdminAiModel = {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  apiKeyMasked: string;
  enabled: boolean;
  usageCount: number;
  updatedAt: string;
};

export type AdminWorkflow = {
  id: string;
  name: string;
  companyName: string;
  companyId: string;
  status: "ACTIVE" | "DRAFT" | "PAUSED";
  runs24h: number;
  updatedAt: string;
};

export type AdminDashboardStats = {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalCompanies: number;
  activeCompanies: number;
  totalWorkflows: number;
  aiModelsEnabled: number;
  aiModelsTotal: number;
  signups7d: number;
  apiCalls24h: number;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type UsersQuery = {
  search?: string;
  status?: UserStatus | "";
  role?: Role | "";
  page?: number;
  pageSize?: number;
};

export type CreateAiModelPayload = {
  name: string;
  provider: string;
  modelId: string;
  apiKey: string;
  enabled?: boolean;
};

export type UpdateAiModelPayload = Partial<CreateAiModelPayload>;
