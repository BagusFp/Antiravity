"use client";

import { useState, useEffect } from "react";
import { ListPlus } from "lucide-react";
import AnimeCarousel from "./AnimeCarousel";
import { myListService, MyListItem } from "@/services/my-list";

export default function MyListHomepageSection() {
  const [items, setItems] = useState<MyListItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setItems(myListService.getItems());

    // Listen to list changes to dynamically add/remove the carousel section in real-time
    const handleUpdate = () => {
      setItems(myListService.getItems());
    };

    window.addEventListener("mag_my_list_updated", handleUpdate);
    return () => {
      window.removeEventListener("mag_my_list_updated", handleUpdate);
    };
  }, []);

  if (!isMounted || items.length === 0) return null;

  return (
    <section className="animate-fade-in">
      <div className="flex items-center space-x-2 text-accent mb-1 px-4 sm:px-0">
        <ListPlus className="w-5 h-5 animate-pulse" />
        <span className="text-xs uppercase font-extrabold tracking-widest text-accent/80">
          Your Watchlist
        </span>
      </div>
      <AnimeCarousel
        title="My List"
        items={items.map((item) => ({
          id: item.id,
          title: item.title,
          image: item.image,
          rating: item.rating,
          type: item.type,
          episodesCount: item.episodesCount,
        }))}
        viewMoreHref="/my-list"
      />
    </section>
  );
}
