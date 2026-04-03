"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { searchYouTube } from "@/actions/queue";

interface SearchResult {
  videoId: string;
  title: string;
  thumbnail: string;
}

interface SearchBarProps {
  onResults: (results: SearchResult[]) => void;
}

export default function SearchBar({ onResults }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const results = await searchYouTube(query);
      onResults(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Search for a song..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        className="flex-1 border rounded px-3 py-2 bg-transparent text-white"
      />
      <Button onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </Button>
    </div>
  );
}
