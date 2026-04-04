"use client";

import { useState } from "react";
import { addToQueue } from "@/actions/queue";
import QueueList from "@/components/queue/QueueList";
import SearchBar from "@/components/queue/SearchBar";
import SearchResults from "@/components/queue/SearchResults";
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
}

interface RoomQueueProps {
  roomId: string;
  initialQueue: QueueItem[];
}

export default function RoomQueue({ roomId, initialQueue }: RoomQueueProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItem[]>(initialQueue);
  const { setOpen } = useAuthModal();

  const handleAdd = async (result: SearchResult) => {
    try {
      const { id } = await addToQueue({
        roomId,
        videoId: result.videoId,
        title: result.title,
        thumbnail: result.thumbnail,
      });
      setQueueItems((prev) => [
        ...prev,
        {
          id,
          videoId: result.videoId,
          title: result.title,
          thumbnail: result.thumbnail,
          voteCount: 0,
        },
      ]);
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
      <QueueList items={queueItems} />
    </div>
  );
}
