import "dotenv/config";
import http from "node:http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

if (!INTERNAL_SECRET) {
  throw new Error("INTERNAL_SECRET is required");
}

const httpServer = http.createServer((req, res) => {
  if (req.headers["x-internal-secret"] !== INTERNAL_SECRET) {
    res.writeHead(401).end("Unauthorized");
    return;
  }

  const chunks: Buffer[] = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    let body: { roomId?: string; [key: string]: unknown };
    try {
      body = JSON.parse(Buffer.concat(chunks).toString() || "{}");
    } catch {
      res.writeHead(400).end("Invalid JSON");
      return;
    }

    if (!body.roomId || typeof body.roomId !== "string") {
      res.writeHead(400).end("Missing or invalid roomId");
      return;
    }

    if (req.url === "/internal/events/queue-updated" && req.method === "POST") {
      io.to(body.roomId).emit("queue:updated", body);
      res.writeHead(200).end("OK");
      return;
    }

    if (req.url === "/internal/events/vote-updated" && req.method === "POST") {
      io.to(body.roomId).emit("vote:updated", body);
      res.writeHead(200).end("OK");
      return;
    }

    res.writeHead(404).end("Not found");
  });
});

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId: string) => {
    socket.join(roomId);
  });

  socket.on("leave-room", (roomId: string) => {
    socket.leave(roomId);
  });
});

httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

export { io };
