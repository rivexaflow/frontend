"use client";

import { socketStore } from "@/stores/socket.store";

export const useSocket = () => socketStore();
