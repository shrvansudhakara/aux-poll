"use server";

import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { rooms, roomMembers } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function createRoom(name: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const id = nanoid();
  const code = nanoid(6).toUpperCase();

  await db.insert(rooms).values({
    id,
    code,
    name,
    hostId: session.user.id,
    isActive: 1,
  });

  await db.insert(roomMembers).values({
    id: nanoid(),
    roomId: id,
    userId: session.user.id,
    role: "host",
  });

  return { code };
}

export async function joinRoom(code: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const room = await db
    .select()
    .from(rooms)
    .where(eq(rooms.code, code.toUpperCase()))
    .limit(1);

  if (!room.length) {
    throw new Error("Room not found");
  }

  if (!room[0].isActive) {
    throw new Error("Room is no longer active");
  }

  const existingMember = await db
    .select()
    .from(roomMembers)
    .where(
      and(
        eq(roomMembers.roomId, room[0].id),
        eq(roomMembers.userId, session.user.id),
      ),
    )
    .limit(1);

  if (existingMember.length) {
    return { code: room[0].code };
  }

  await db.insert(roomMembers).values({
    id: nanoid(),
    roomId: room[0].id,
    userId: session.user.id,
    role: "member",
  });

  return { code: room[0].code };
}
