"use client";

interface QueueItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  voteCount: number;
}

interface QueueListProps {
  items: QueueItem[];
}

export default function QueueList({ items }: QueueListProps) {
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
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-20 h-14 object-cover rounded"
          />
          <p className="flex-1 text-sm">{item.title}</p>
          <span className="text-sm text-muted-foreground">
            {item.voteCount} votes
          </span>
        </div>
      ))}
    </div>
  );
}
