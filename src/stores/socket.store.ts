"use client";

import { create } from "zustand";
import type { AgentPresence, LiveActivity } from "@/types/common";

type SocketState = {
  connected: boolean;
  statuses: AgentPresence[];
  liveFeed: LiveActivity[];
  setConnected: (value: boolean) => void;
  setStatuses: (items: AgentPresence[]) => void;
  pushActivity: (item: LiveActivity) => void;
};

export const socketStore = create<SocketState>((set) => ({
  connected: false,
  statuses: [],
  liveFeed: [],
  setConnected: (connected) => set({ connected }),
  setStatuses: (statuses) => set({ statuses }),
  pushActivity: (item) => set((state) => ({ liveFeed: [item, ...state.liveFeed].slice(0, 30) }))
}));
