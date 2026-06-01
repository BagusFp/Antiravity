"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Compass, Inbox, ListPlus } from "lucide-react";
import AnimeCard from "@/components/home/AnimeCard";
import { myListService, MyListItem } from "@/services/my-list";

export default function MyListPage() {
  const [items, setItems] = useState<MyListItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Synchronize with local storage on client mount
  useEffect(() => {
    setIsMounted(true);
    setItems(myListService.getItems());

    // Listen to updates from other pages/components dynamically
    const handleUpdate = () => {
      setItems(myListService.getItems());
    };

    window.addEventListener("mag_my_list_updated", handleUpdate);
    return () => {
      window.removeEventListener("mag_my_list_updated", handleUpdate);
    };
  }, []);

  // Prevent server-side hydration mismatches by returning a skeletal loading grid initially
  if (!isMounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#0B0B0F] min-h-[70vh]">
        <div className="space-y-2 animate-pulse">
          <div className="w-48 h-8 bg-white/5 rounded-lg" />
          <div className="w-72 h-4 bg-white/5 rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3 animate-pulse">
              <div className="aspect-[3/4] w-full rounded-xl bg-white/5" />
              <div className="h-4 bg-white/5 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#0B0B0F] min-h-[75vh]">
      {/* Header Info */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-3">
          <ListPlus className="w-8 h-8 text-accent animate-pulse" />
          <span>My List</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Your personalized collection of saved shows and movies, stored securely in your browser.
        </p>
      </div>

      {/* Grid or Empty State */}
      <div className="min-h-[50vh]">
        {items.length === 0 ? (
          /* Premium Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 glass rounded-3xl border border-white/5 max-w-xl mx-auto animate-fade-in shadow-xl">
            <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-lg shadow-accent/5">
              <Inbox className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-wide">Your My List is empty</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Explore our catalogs, schedule, or search for titles to add your favorite anime and organize your watchlist.
              </p>
            </div>
            <Link
              href="/search"
              className="flex items-center space-x-2 px-6 py-3 rounded-full bg-accent hover:bg-accent-hover text-white font-semibold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
            >
              <Compass className="w-4 h-4 fill-current" />
              <span>Browse Anime</span>
            </Link>
          </div>
        ) : (
          /* Anime Card Grid matching Paginated and Search layouts */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 animate-fade-in">
            {items.map((item) => (
              <AnimeCard
                key={item.id}
                anime={{
                  id: item.id,
                  title: item.title,
                  image: item.image,
                  rating: item.rating,
                  type: item.type,
                  episodesCount: item.episodesCount,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
