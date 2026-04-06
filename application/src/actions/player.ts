"use server";

import { eq } from "drizzle-orm";
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

  const [played] = await db
    .update(queue)
    .set({ played: 1 })
    .where(eq(queue.id, queueId))
    .returning();

  if (played) {
    await emitEvent("/internal/events/song-played", {
      roomId: played.roomId,
      queueId,
    });
  }
}

export async function emitNowPlaying(roomId: string, title: string) {
  await emitEvent("/internal/events/player-playing", { roomId, title });
}
