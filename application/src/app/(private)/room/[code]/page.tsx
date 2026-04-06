import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import RoomQueue from "@/components/queue/RoomQueue";
import RoomProvider from "@/components/room/RoomProvider";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { queue, rooms, votes } from "@/lib/db/schema";

interface RoomPageProps {
  params: Promise<{ code: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { code } = await params;

  const room = await db
    .select()
    .from(rooms)
    .where(eq(rooms.code, code))
    .limit(1);

  if (!room.length) {
    notFound();
  }

  const queueItems = await db
    .select()
    .from(queue)
    .where(eq(queue.roomId, room[0].id))
    .orderBy(desc(queue.voteCount), queue.createdAt);

  const session = await auth.api.getSession({ headers: await headers() });

  const userVotes = session
    ? await db
        .select({ queueId: votes.queueId })
        .from(votes)
        .where(eq(votes.userId, session.user.id))
    : [];

  const votedQueueIds = new Set(userVotes.map((v) => v.queueId));

  return (
    <RoomProvider roomId={room[0].id}>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-start gap-6 p-6">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold">{room[0].name}</h1>
            <p className="text-muted-foreground">Room Code: {room[0].code}</p>
          </div>
          <RoomQueue
            roomId={room[0].id}
            initialQueue={queueItems}
            initialVotedIds={votedQueueIds}
          />
        </div>
      </div>
    </RoomProvider>
  );
}
