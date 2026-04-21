export type Role = "SUPER_ADMIN" | "ADMIN" | "USER";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  workspaceId?: string;
};

export type AgentPresence = {
  userId: string;
  name: string;
  status: "online" | "idle" | "offline";
  lastSeenAt: string;
};

export type LiveActivity = {
  id: string;
  action: string;
  actor: string;
  createdAt: string;
};
