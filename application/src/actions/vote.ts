"use server";

import { and, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { queue, votes } from "@/lib/db/schema";
import { emitEvent } from "@/lib/socket/emit";

export async function toggleVote(queueId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const existingVote = await db
    .select()
    .from(votes)
    .where(and(eq(votes.queueId, queueId), eq(votes.userId, session.user.id)))
    .limit(1);

  if (existingVote.length) {
    await db.delete(votes).where(eq(votes.id, existingVote[0].id));
    await db
      .update(queue)
      .set({ voteCount: sql`GREATEST(${queue.voteCount} - 1, 0)` })
      .where(eq(queue.id, queueId));

    const updatedUnvote = await db
      .select()
      .from(queue)
      .where(eq(queue.id, queueId))
      .limit(1);

    if (updatedUnvote[0]) {
      await emitEvent("/internal/events/vote-updated", {
        roomId: updatedUnvote[0].roomId,
        queueId,
        voteCount: updatedUnvote[0].voteCount,
        voted: false,
      });
    }

    return { voted: false };
  }

  const inserted = await db
    .insert(votes)
    .values({
      id: nanoid(),
      queueId,
      userId: session.user.id,
    })
    .onConflictDoNothing()
    .returning();

  if (inserted.length) {
    await db
      .update(queue)
      .set({ voteCount: sql`${queue.voteCount} + 1` })
      .where(eq(queue.id, queueId));

    const updatedVote = await db
      .select()
      .from(queue)
      .where(eq(queue.id, queueId))
      .limit(1);

    if (updatedVote[0]) {
      await emitEvent("/internal/events/vote-updated", {
        roomId: updatedVote[0].roomId,
        queueId,
        voteCount: updatedVote[0].voteCount,
        voted: true,
      });
    }

    return { voted: true };
  }

  return { voted: true };
}
