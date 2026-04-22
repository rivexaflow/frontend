"use client";

import { ReactNode, useEffect } from "react";
import { authStore } from "@/stores/auth.store";
import { socketStore } from "@/stores/socket.store";
import { connectSocket, disconnectSocket } from "@/lib/socket/client";
import { socketEvents } from "@/lib/socket/events";

export function SocketProvider({ children }: { children: ReactNode }) {
  const token = authStore((s) => s.token);
  const workspaceId = authStore((s) => s.user?.workspaceId);
  const { setConnected, setStatuses, pushActivity } = socketStore();

  useEffect(() => {
    if (!token || !workspaceId) return;
    const socket = connectSocket(token, workspaceId);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on(socketEvents.presenceUpdate, (payload) => setStatuses(payload));
    socket.on(socketEvents.activityNew, (payload) => pushActivity(payload));
    return () => {
      socket.removeAllListeners();
      disconnectSocket();
      setConnected(false);
    };
  }, [token, workspaceId, setConnected, setStatuses, pushActivity]);

  return children;
}
