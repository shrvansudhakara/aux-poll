import { db } from "@/lib/db";
import { queue, rooms } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import RoomQueue from "@/components/queue/RoomQueue";

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

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-start gap-6 p-6">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">{room[0].name}</h1>
          <p className="text-muted-foreground">Room Code: {room[0].code}</p>
        </div>
        <RoomQueue roomId={room[0].id} initialQueue={queueItems} />
      </div>
    </div>
  );
}
