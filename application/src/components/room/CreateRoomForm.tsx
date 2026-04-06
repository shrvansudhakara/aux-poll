"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createRoom } from "@/actions/room";
import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/lib/context/auth-modal";

export default function CreateRoomForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setOpen } = useAuthModal();

  const handleCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setLoading(true);
    setError("");
    try {
      const { code } = await createRoom(trimmedName);
      router.push(`/room/${code}`);
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        setOpen(true);
      } else {
        setError("Failed to create room. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <input
        type="text"
        placeholder="Room name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded px-3 py-2 bg-transparent text-white"
      />
      <Button onClick={handleCreate} disabled={loading}>
        {loading ? "Creating..." : "Create Room"}
      </Button>
    </div>
  );
}
