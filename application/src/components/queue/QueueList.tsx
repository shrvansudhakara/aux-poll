"use client";

import Image from "next/image";
import VoteButton from "@/components/queue/VoteButton";

interface QueueItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  voteCount: number;
}

interface QueueListProps {
  items: QueueItem[];
  onVote: (queueId: string, voted: boolean) => void;
}

export default function QueueList({ items, onVote }: QueueListProps) {
  if (!items.length) {
    return (
      <p className="text-muted-foreground text-sm text-center">
        No songs in the queue yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="flex items-center gap-3 border rounded p-2"
        >
          <span className="text-muted-foreground text-sm w-4">{index + 1}</span>
          <Image
            src={item.thumbnail}
            alt={item.title}
            width={80}
            height={45}
            className="object-cover rounded"
          />
          <p className="flex-1 text-sm">{item.title}</p>
          <VoteButton
            queueId={item.id}
            voteCount={item.voteCount}
            onVote={onVote}
          />
        </div>
      ))}
    </div>
  );
}
