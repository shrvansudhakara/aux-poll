"use client";

import { useEffect, useState } from "react";
import { addToQueue } from "@/actions/queue";
import QueueList from "@/components/queue/QueueList";
import SearchBar from "@/components/queue/SearchBar";
import SearchResults from "@/components/queue/SearchResults";
import { useRoom } from "@/components/room/RoomProvider";
import { useAuthModal } from "@/lib/context/auth-modal";

interface SearchResult {
  videoId: string;
  title: string;
  thumbnail: string;
}

interface QueueItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  voteCount: number;
  createdAt: Date;
}

interface RoomQueueProps {
  roomId: string;
  initialQueue: QueueItem[];
  initialVotedIds: Set<string>;
}

export default function RoomQueue({
  roomId,
  initialQueue,
  initialVotedIds,
}: RoomQueueProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItem[]>(initialQueue);
  const { setOpen } = useAuthModal();
  const { socket } = useRoom();

  useEffect(() => {
    const onQueueUpdated = (item: QueueItem) => {
      setQueueItems((prev) => {
        if (prev.some((q) => q.id === item.id)) return prev;
        return [...prev, item];
      });
    };

    const onVoteUpdated = (data: { queueId: string; voteCount: number }) => {
      setQueueItems((prev) =>
        [...prev]
          .map((item) =>
            item.id === data.queueId
              ? {
                  ...item,
                  voteCount: data.voteCount,
                }
              : item,
          )
          .sort(
            (a, b) =>
              b.voteCount - a.voteCount ||
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
      );
    };

    socket.on("queue:updated", onQueueUpdated);
    socket.on("vote:updated", onVoteUpdated);

    return () => {
      socket.off("queue:updated", onQueueUpdated);
      socket.off("vote:updated", onVoteUpdated);
    };
  }, [socket]);

  const handleAdd = async (result: SearchResult) => {
    try {
      await addToQueue({
        roomId,
        videoId: result.videoId,
        title: result.title,
        thumbnail: result.thumbnail,
      });
      setResults([]);
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        setOpen(true);
      } else {
        console.error(error);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SearchBar onResults={setResults} />
      <SearchResults results={results} onAdd={handleAdd} />
      <QueueList items={queueItems} votedIds={initialVotedIds} />
    </div>
  );
}
