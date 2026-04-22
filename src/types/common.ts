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
