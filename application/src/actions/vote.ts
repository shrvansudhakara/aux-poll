"use server";

import { and, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { queue, votes } from "@/lib/db/schema";

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
      .set({ voteCount: sql`${queue.voteCount} - 1` })
      .where(eq(queue.id, queueId));
    return { voted: false };
  }

  await db.insert(votes).values({
    id: nanoid(),
    queueId,
    userId: session.user.id,
  });

  await db
    .update(queue)
    .set({ voteCount: sql`${queue.voteCount} + 1` })
    .where(eq(queue.id, queueId));

  return { voted: true };
}
