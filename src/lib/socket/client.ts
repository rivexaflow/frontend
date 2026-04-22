"use client";

import { io, Socket } from "socket.io-client";
import { socketEvents } from "@/lib/socket/events";

let socket: Socket | null = null;

export const getSocket = () => socket;

export const connectSocket = (token: string, workspaceId: string) => {
  socket?.disconnect();
  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000", {
    auth: { token }
  });
  socket.emit(socketEvents.joinWorkspace, { workspaceId });
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
