"use client";

import { useState } from "react";
import { toggleVote } from "@/actions/vote";
import { useAuthModal } from "@/lib/context/auth-modal";

interface VoteButtonProps {
  queueId: string;
  voteCount: number;
  onVote: (queueId: string, voted: boolean) => void;
}

export default function VoteButton({
  queueId,
  voteCount,
  onVote,
}: VoteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);
  const { setOpen } = useAuthModal();

  const handleVote = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { voted: newVoted } = await toggleVote(queueId);
      setVoted(newVoted);
      onVote(queueId, newVoted);
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        setOpen(true);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleVote}
      disabled={loading}
      className={`flex flex-col items-center px-3 py-1 rounded border transition-colors ${
        voted
          ? "border-orange-500 text-orange-500"
          : "border-zinc-600 text-zinc-400 hover:border-orange-500 hover:text-orange-500"
      }`}
    >
      <span className="text-lg leading-none">▲</span>
      <span className="text-xs">{voteCount}</span>
    </button>
  );
}
