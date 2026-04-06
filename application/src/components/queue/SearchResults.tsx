"use client";

import Image from "next/image";

interface SearchResult {
  videoId: string;
  title: string;
  thumbnail: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  onAdd: (result: SearchResult) => void;
}

export default function SearchResults({ results, onAdd }: SearchResultsProps) {
  if (!results.length) return null;

  return (
    <div className="flex flex-col gap-2">
      {results.map((result) => (
        <div
          key={result.videoId}
          className="flex items-center gap-3 border rounded p-2"
        >
          <Image
            src={result.thumbnail}
            alt={result.title}
            width={80}
            height={45}
            className="object-cover rounded"
          />
          <p className="flex-1 text-sm">{result.title}</p>
          <button
            type="button"
            onClick={() => onAdd(result)}
            className="text-sm px-3 py-1 border rounded hover:bg-white hover:text-black transition-colors"
          >
            Add
          </button>
        </div>
      ))}
    </div>
  );
}
