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
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);

  useEffect(() => {
    const onQueueUpdated = (item: QueueItem) => {
      setQueueItems((prev) => {
        if (prev.some((q) => q.id === item.id)) return prev;
        return [...prev, item].sort(
          (a, b) =>
            b.voteCount - a.voteCount ||
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
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

    const onPlayerPlaying = (data: { title: string }) => {
      setNowPlaying(data.title || null);
    };

    const onSongPlayed = (data: { queueId: string }) => {
      setQueueItems((prev) => prev.filter((item) => item.id !== data.queueId));
    };

    socket.on("queue:updated", onQueueUpdated);
    socket.on("vote:updated", onVoteUpdated);
    socket.on("player:playing", onPlayerPlaying);
    socket.on("song:played", onSongPlayed);

    return () => {
      socket.off("queue:updated", onQueueUpdated);
      socket.off("vote:updated", onVoteUpdated);
      socket.off("player:playing", onPlayerPlaying);
      socket.off("song:played", onSongPlayed);
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
      {nowPlaying && (
        <div className="border rounded p-3 flex items-center gap-2">
          <span className="text-orange-500 text-sm font-medium">
            ▶ Now Playing:
          </span>
          <span className="text-sm">{nowPlaying}</span>
        </div>
      )}
      <SearchBar onResults={setResults} />
      <SearchResults results={results} onAdd={handleAdd} />
      <QueueList items={queueItems} votedIds={initialVotedIds} />
    </div>
  );
}
