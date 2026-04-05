"use client";

import { createContext, useContext, useEffect } from "react";
import type { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket/client";

interface RoomContextValue {
  socket: Socket;
  roomId: string;
}

const RoomContext = createContext<RoomContextValue | null>(null);

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used within RoomProvider");
  return ctx;
}

interface RoomProviderProps {
  roomId: string;
  children: React.ReactNode;
}

export default function RoomProvider({ roomId, children }: RoomProviderProps) {
  const socket = getSocket();

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => {
      socket.emit("join-room", roomId);
    });

    return () => {
      socket.emit("leave-room", roomId);
      socket.disconnect();
    };
  }, [roomId, socket]);
  return (
    <RoomContext.Provider value={{ socket, roomId }}>
      {children}
    </RoomContext.Provider>
  );
}
