"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Check, Film } from "lucide-react";
import { historyStorage } from "@/utils/history";

interface Episode {
  id: string;
  number: number;
  title?: string;
}

interface EpisodePlaylistProps {
  episodes: Episode[];
  currentEpisodeNumber: number;
  animeId: string;
  animeTitle: string;
}

const cleanEpisodeTitle = (epTitle: string, animeTitle: string, epNum: number) => {
  if (!epTitle) return `Episode ${epNum}`;
  
  let cleaned = epTitle;
  const escapedAnimeTitle = animeTitle.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`^${escapedAnimeTitle}\\s*(-\\s*)?`, 'i');
  cleaned = cleaned.replace(regex, '');
  cleaned = cleaned.replace(/^\s*(episode|ep|eps)\s*/i, 'Episode ');
  
  if (!cleaned.trim()) {
    return `Episode ${epNum}`;
  }
  
  return cleaned.trim();
};

export default function EpisodePlaylist({
  episodes,
  currentEpisodeNumber,
  animeId,
  animeTitle,
}: EpisodePlaylistProps) {
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

  return (
    <div className="lg:col-span-4 rounded-2xl bg-muted/20 border border-white/5 overflow-hidden flex flex-col max-h-[600px]">
      {/* Header panel */}
      <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 text-white">
          <Film className="w-5 h-5 text-accent" />
          <h3 className="font-bold text-sm tracking-wide uppercase">
            Episode List
          </h3>
        </div>
        <span className="text-xs text-muted-foreground font-semibold">
          {episodes.length} Airing
        </span>
      </div>

      {/* Scrollable Episode Playlist */}
      <div className="divide-y divide-white/5 overflow-y-auto pr-1">
        {episodes.map((ep) => {
          const isActive = ep.number === currentEpisodeNumber;
          const isWatched = checkIsWatched(ep);

          return (
            <Link
              key={ep.id}
              href={`/watch/${encodeURIComponent(ep.id)}`}
              className={`flex items-center justify-between px-4 py-3.5 transition-all text-sm group ${
                isActive
                  ? "bg-accent/20 border-l-4 border-accent text-accent font-bold"
                  : isWatched
                  ? "bg-purple-950/20 text-purple-200/90 hover:bg-white/5 hover:text-white"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate pr-3">
                {isWatched && (
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0" title="Telah Ditonton">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
                <span className="truncate">
                  {cleanEpisodeTitle(ep.title || "", animeTitle, ep.number)}
                </span>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {isWatched && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Ditonton
                  </span>
                )}
                {isActive ? (
                  <Play className="w-3.5 h-3.5 fill-current text-accent" />
                ) : (
                  <Play className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
