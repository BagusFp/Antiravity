"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { historyStorage } from "@/utils/history";

interface Episode {
  id: string;
  number: number;
  title?: string;
}

interface EpisodeGridProps {
  episodes: Episode[];
  animeId: string;
}

export default function EpisodeGrid({ episodes, animeId }: EpisodeGridProps) {
  const [watchedKeys, setWatchedKeys] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);

  const updateWatchedState = () => {
    setWatchedKeys(historyStorage.getWatchedKeys());
  };

  useEffect(() => {
    setIsMounted(true);
    updateWatchedState();

    const handleUpdate = () => {
      updateWatchedState();
    };

    window.addEventListener("mag_history_updated", handleUpdate);
    return () => {
      window.removeEventListener("mag_history_updated", handleUpdate);
    };
  }, []);

  const checkIsWatched = (ep: Episode) => {
    if (!isMounted) return false;
    const epId = ep.id;
    const encodedEpId = encodeURIComponent(epId);
    const keyWithAnime = `${animeId}_ep_${ep.number}`;

    return (
      watchedKeys.has(epId) ||
      watchedKeys.has(encodedEpId) ||
      watchedKeys.has(`/watch/${epId}`) ||
      watchedKeys.has(`/watch/${encodedEpId}`) ||
      watchedKeys.has(keyWithAnime)
    );
  };

  if (!episodes || episodes.length === 0) {
    return (
      <div className="p-8 glass rounded-2xl text-center text-muted-foreground">
        No episodes have been released yet for this show.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-12 gap-3 max-h-[350px] overflow-y-auto pr-2">
      {episodes.map((episode) => {
        const isWatched = checkIsWatched(episode);

        return (
          <Link
            key={episode.id}
            href={`/watch/${encodeURIComponent(episode.id)}`}
            className={`relative flex flex-col items-center justify-center h-11 rounded-lg text-sm font-semibold border transition-all duration-200 hover:scale-[1.04] active:scale-95 group ${
              isWatched
                ? "bg-purple-950/40 border-purple-500/40 text-purple-200 hover:bg-accent hover:border-accent hover:text-white shadow-sm shadow-purple-900/20"
                : "bg-muted/40 border-white/5 text-white/90 hover:bg-accent hover:border-accent"
            }`}
            title={
              isWatched
                ? `${episode.title || `Episode ${episode.number}`} (Telah Ditonton)`
                : episode.title || `Episode ${episode.number}`
            }
          >
            <span>{episode.number}</span>

            {/* Watched Indicator Badge */}
            {isWatched && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80 flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
