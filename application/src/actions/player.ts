"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { queue, rooms } from "@/lib/db/schema";
import { emitEvent } from "@/lib/socket/emit";

export async function isHost(roomId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return false;

  const room = await db
    .select()
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .limit(1);

  return room[0]?.hostId === session.user.id;
}

export async function markAsPlayed(queueId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  const target = await db
    .select({ hostId: rooms.hostId, roomId: queue.roomId })
    .from(queue)
    .innerJoin(rooms, eq(queue.roomId, rooms.id))
    .where(eq(queue.id, queueId))
    .limit(1);
  if (!target[0] || target[0].hostId !== session.user.id) {
    throw new Error("Forbidden");
  }
  const [played] = await db
    .update(queue)
    .set({ played: 1 })
    .where(and(eq(queue.id, queueId), eq(queue.played, 0)))
    .returning();
  if (played) {
    await emitEvent("/internal/events/song-played", {
      roomId: played.roomId,
      queueId,
    });
  }
}

export async function emitNowPlaying(roomId: string, title: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  const room = await db
    .select({ hostId: rooms.hostId })
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .limit(1);
  if (!room[0] || room[0].hostId !== session.user.id) {
    throw new Error("Forbidden");
  }
  await emitEvent("/internal/events/player-playing", { roomId, title });
}
