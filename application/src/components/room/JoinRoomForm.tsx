"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { joinRoom } from "@/actions/room";
import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/lib/context/auth-modal";

export default function JoinRoomForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setOpen } = useAuthModal();

  const handleJoin = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { code: roomCode } = await joinRoom(code);
      router.push(`/room/${roomCode}`);
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized") {
        setOpen(true);
      } else {
        setError(err instanceof Error ? err.message : "Failed to join room");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Enter room code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="border rounded px-3 py-2 bg-transparent text-white"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button onClick={handleJoin} disabled={loading}>
        {loading ? "Joining..." : "Join Room"}
      </Button>
    </div>
  );
}
