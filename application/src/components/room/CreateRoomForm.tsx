"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createRoom } from "@/actions/room";
import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/lib/context/auth-modal";

export default function CreateRoomForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setOpen } = useAuthModal();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const { code } = await createRoom(name);
      router.push(`/room/${code}`);
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
    <div className="flex flex-col gap-4">
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
