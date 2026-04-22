"use client";

import { create } from "zustand";

type UiState = {
  notifications: string[];
  activeModal: string | null;
  pushNotification: (message: string) => void;
  clearNotifications: () => void;
  setActiveModal: (modalId: string | null) => void;
};

export const uiStore = create<UiState>((set) => ({
  notifications: [],
  activeModal: null,
  pushNotification: (message) =>
    set((state) => ({ notifications: [...state.notifications, message].slice(-10) })),
  clearNotifications: () => set({ notifications: [] }),
  setActiveModal: (modalId) => set({ activeModal: modalId })
}));
