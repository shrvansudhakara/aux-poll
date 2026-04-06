import { io, type Socket } from "socket.io-client";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "");

if (!WS_URL) {
  throw new Error("NEXT_PUBLIC_WS_URL is required in production");
}

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      autoConnect: false,
    });
  }
  return socket;
}
