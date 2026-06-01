"use client";

import { useState, useEffect } from "react";
import { Plus, Check } from "lucide-react";
import { myListService } from "@/services/my-list";

interface MyListButtonProps {
  anime: {
    id: string;
    title: string;
    image: string;
    type: string;
    rating?: string;
    episodesCount?: number;
  };
}

export default function MyListButton({ anime }: MyListButtonProps) {
  const [isInList, setIsInList] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Synchronize with storage on client mount
  useEffect(() => {
    setIsMounted(true);
    setIsInList(myListService.hasItem(anime.id));

    // Handle potential updates from other components in real-time
    const handleUpdate = () => {
      setIsInList(myListService.hasItem(anime.id));
    };

    window.addEventListener("mag_my_list_updated", handleUpdate);
    return () => {
      window.removeEventListener("mag_my_list_updated", handleUpdate);
    };
  }, [anime.id]);

  const handleToggle = () => {
    const updated = myListService.toggleItem({
      id: anime.id,
      title: anime.title,
      image: anime.image,
      slug: anime.id, // Direct ID is mapped as the routing slug
      type: anime.type || "TV Series",
      rating: anime.rating,
      episodesCount: anime.episodesCount,
    });
    setIsInList(updated);
  };

  // Prevent server-side hydration mismatch by rendering a consistent mock layout initially
  if (!isMounted) {
    return (
      <button className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/5 transition-all text-center cursor-default">
        <Plus className="w-4 h-4 text-white/60" />
        <span>My List</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={isInList ? "Remove from My List" : "Add to My List"}
      className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-medium border transition-all text-center active:scale-95 ${
        isInList
          ? "bg-accent/10 border-accent/40 text-accent hover:bg-accent/20 shadow-lg shadow-accent/5"
          : "bg-white/5 hover:bg-white/10 text-white border-white/5"
      }`}
    >
      {isInList ? (
        <>
          <Check className="w-4 h-4 text-accent" />
          <span>Added to My List</span>
        </>
      ) : (
        <>
          <Plus className="w-4 h-4 text-white" />
          <span>My List</span>
        </>
      )}
    </button>
  );
}
