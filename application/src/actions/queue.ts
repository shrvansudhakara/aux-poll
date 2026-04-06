"use server";

import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { queue } from "@/lib/db/schema";
import { emitEvent } from "@/lib/socket/emit";

const searchSchema = z.object({
  query: z.string().trim().min(1).max(100),
});

const addToQueueSchema = z.object({
  roomId: z.string().min(1),
  videoId: z.string().min(1),
  title: z.string().min(1).max(200),
  thumbnail: z.url(),
});

export async function searchYouTube(query: string) {
  const { query: trimmedQuery } = searchSchema.parse({ query });

  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error("YOUTUBE_API_KEY is required");
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "10");
  url.searchParams.set("q", trimmedQuery);
  url.searchParams.set("key", process.env.YOUTUBE_API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch YouTube results");

  const data = await res.json();

  if (!Array.isArray(data.items)) {
    return [];
  }

  return data.items.map(
    (item: {
      id: { videoId: string };
      snippet: { title: string; thumbnails: { medium: { url: string } } };
    }) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
    }),
  );
}

export async function addToQueue(input: {
  roomId: string;
  videoId: string;
  title: string;
  thumbnail: string;
}) {
  const validated = addToQueueSchema.parse(input);
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) throw new Error("Unauthorized");

  const id = nanoid();

  const [inserted] = await db
    .insert(queue)
    .values({
      id,
      roomId: validated.roomId,
      videoId: validated.videoId,
      title: validated.title,
      thumbnail: validated.thumbnail,
      addedBy: session.user.id,
    })
    .returning();

  await emitEvent("/internal/events/queue-updated", {
    roomId: validated.roomId,
    id,
    videoId: validated.videoId,
    title: validated.title,
    thumbnail: validated.thumbnail,
    voteCount: 0,
    createdAt: inserted.createdAt,
  });

  return { id };
}
