"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Compass, Inbox, History as HistoryIcon, Trash2, X, Play } from "lucide-react";
import { historyStorage, HistoryItem } from "@/utils/history";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const loadItems = () => {
    setItems(historyStorage.getAll());
  };

  useEffect(() => {
    setIsMounted(true);
    loadItems();

    // Listen to updates dynamically
    const handleUpdate = () => {
      loadItems();
    };

    window.addEventListener("mag_history_updated", handleUpdate);
    return () => {
      window.removeEventListener("mag_history_updated", handleUpdate);
    };
  }, []);

  const handleRemove = (e: React.MouseEvent, watchUrl: string) => {
    e.preventDefault();
    e.stopPropagation();
    historyStorage.remove(watchUrl);
    loadItems();
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear your entire watch history?")) {
      historyStorage.clear();
      loadItems();
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-3">
            <HistoryIcon className="w-8 h-8 text-accent animate-pulse" />
            <span>Watch History</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Keep track of all the episodes you have opened and watched. Stored locally in your browser.
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 transition-all text-sm font-semibold cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All History</span>
          </button>
        )}
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
              <h3 className="text-xl font-bold text-white tracking-wide">No history found</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                You haven't watched any episodes yet. Start exploring or searching to find your next anime!
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center space-x-2 px-6 py-3 rounded-full bg-accent hover:bg-accent-hover text-white font-semibold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
            >
              <Compass className="w-4 h-4 fill-current" />
              <span>Explore Anime</span>
            </Link>
          </div>
        ) : (
          /* Anime Card Grid matching Paginated and Search layouts */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 animate-fade-in">
            {items.map((item) => (
              <div key={item.watchUrl} className="group/card relative flex flex-col space-y-2">
                <Link
                  href={item.watchUrl}
                  className="block relative flex flex-col space-y-2"
                >
                  {/* Image wrapper */}
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-muted/30 border border-white/5 shadow-sm transition-all duration-300 sm:group-hover/card:scale-[1.03] sm:group-hover/card:border-accent/20">
                    {/* Cover image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80"}
                      alt={item.animeTitle}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />

                    {/* Single item X delete button */}
                    <button
                      onClick={(e) => handleRemove(e, item.watchUrl)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/75 hover:bg-red-500 text-white transition-colors z-20 shadow-md border border-white/5 cursor-pointer"
                      title="Remove from history"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {/* Hover Play button overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 sm:group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/40 transform scale-75 sm:group-hover/card:scale-100 transition-transform duration-300">
                        <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* EP number indicator */}
                    <div className="absolute bottom-2 left-2 z-10 px-1.5 py-0.5 rounded bg-accent/90 text-white text-[9px] font-extrabold uppercase tracking-wide">
                      EP {item.episodeNumber}
                    </div>

                    {/* Timestamp overlay */}
                    <div className="absolute bottom-2 right-2 z-10 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                      {formatRelativeTime(item.timestamp)}
                    </div>
                  </div>

                  {/* Title & Info */}
                  <div className="space-y-0.5 px-0.5">
                    <h3 className="text-sm font-semibold tracking-wide truncate text-white sm:group-hover/card:text-accent transition-colors">
                      {item.animeTitle}
                    </h3>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Episode {item.episodeNumber}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
