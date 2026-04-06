"use client";

import { useEffect, useRef } from "react";
import { emitNowPlaying, markAsPlayed } from "@/actions/player";

interface QueueItem {
  id: string;
  videoId: string;
  title: string;
  voteCount: number;
  played: number;
  createdAt: Date;
}

interface YouTubePlayerProps {
  queue: QueueItem[];
  roomId: string;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        el: string | HTMLElement,
        options: {
          videoId: string;
          playerVars?: Record<string, number>;
          events?: {
            onStateChange?: (event: { data: number }) => void;
          };
        },
      ) => {
        loadVideoById: (videoId: string) => void;
        destroy: () => void;
      };
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function YouTubePlayer({ queue, roomId }: YouTubePlayerProps) {
  const playerRef = useRef<{
    loadVideoById: (videoId: string) => void;
    destroy: () => void;
  } | null>(null);

  const unplayedRef = useRef(
    queue
      .filter((item) => !item.played)
      .sort(
        (a, b) =>
          b.voteCount - a.voteCount ||
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
  );
  const currentIndexRef = useRef(0);
  const advancingRef = useRef(false);

  useEffect(() => {
    const handleNext = async () => {
      if (advancingRef.current) return;
      advancingRef.current = true;
      try {
        const current = unplayedRef.current[currentIndexRef.current];
        if (current) await markAsPlayed(current.id);

        const nextIndex = currentIndexRef.current + 1;
        const next = unplayedRef.current[nextIndex];
        if (next) {
          currentIndexRef.current = nextIndex;
          playerRef.current?.loadVideoById(next.videoId);
          await emitNowPlaying(roomId, next.title);
        }
      } finally {
        advancingRef.current = false;
      }
    };

    window.onYouTubeIframeAPIReady = () => {
      const current = unplayedRef.current[currentIndexRef.current];
      if (!current) return;

      emitNowPlaying(roomId, current.title);

      playerRef.current = new window.YT.Player("yt-player", {
        videoId: current.videoId,
        playerVars: { autoplay: 1 },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              void handleNext().catch(console.error);
            }
          },
        },
      });
    };

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    return () => {
      playerRef.current?.destroy();
    };
  }, [roomId]);

  if (!unplayedRef.current.length) {
    return (
      <p className="text-muted-foreground text-sm text-center">
        Queue is empty, add songs to start playing
      </p>
    );
  }

  return <div id="yt-player" className="w-full aspect-video rounded" />;
}
