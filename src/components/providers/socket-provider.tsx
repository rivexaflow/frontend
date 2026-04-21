"use client";

import { ReactNode, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { authStore } from "@/stores/auth-store";
import { socketStore } from "@/stores/socket-store";

let socket: Socket | null = null;

export function SocketProvider({ children }: { children: ReactNode }) {
  const token = authStore((s) => s.token);
  const workspaceId = authStore((s) => s.user?.workspaceId);
  const { setConnected, setStatuses, pushActivity } = socketStore();

  useEffect(() => {
    if (!token || !workspaceId) return;

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000", {
      auth: { token }
    });

    socket.on("connect", () => {
      setConnected(true);
      socket?.emit("workspace:join", { workspaceId });
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("presence:update", (payload) => setStatuses(payload));
    socket.on("activity:new", (payload) => pushActivity(payload));

    return () => {
      socket?.disconnect();
      socket = null;
      setConnected(false);
    };
  }, [token, workspaceId, setConnected, setStatuses, pushActivity]);

  return children;
}
