import Link from "next/link";
import { Star, Play, Disc } from "lucide-react";
import { AnimeSearchResult } from "@/types/anime";

interface AnimeCardProps {
  anime: AnimeSearchResult;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  const { id, title, image, rating, type, episodesCount } = anime;

  return (
    <Link href={`/anime/${encodeURIComponent(id)}`} className="group block relative flex flex-col space-y-2">
      {/* Visual Image Container */}
      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-muted/30 border border-white/5 shadow-md shadow-black/40 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-accent/15 group-hover:border-accent/20">
        
        {/* Anime Cover */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80"}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover Overlay backdrop */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-accent/40">
            <Play className="w-5 h-5 fill-current ml-1" />
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {rating && rating !== "N/A" && (
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#0B0B0F]/90 text-yellow-500 text-xs font-semibold backdrop-blur-sm border border-white/5">
              <Star className="w-3 h-3 fill-current" />
              <span>{rating}</span>
            </div>
          )}
        </div>

        {/* Bottom Metadata Info Banner */}
        <div className="absolute bottom-2 right-2 z-10 flex gap-1">
          {type && (
            <div className="px-1.5 py-0.5 rounded bg-accent/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
              {type}
            </div>
          )}
          {episodesCount && episodesCount > 0 ? (
            <div className="px-1.5 py-0.5 rounded bg-[#0B0B0F]/90 text-muted-foreground text-[10px] font-bold backdrop-blur-sm border border-white/5">
              EP {episodesCount}
            </div>
          ) : null}
        </div>
      </div>

      {/* Text Info */}
      <div className="space-y-0.5 px-0.5">
        <h3 className="text-sm font-semibold text-white tracking-wide truncate group-hover:text-accent transition-colors duration-200">
          {title}
        </h3>
        <div className="flex items-center text-[11px] text-muted-foreground space-x-1">
          <Disc className="w-3.5 h-3.5 animate-spin-slow shrink-0" />
          <span className="truncate">{type || "TV Series"}</span>
        </div>
      </div>
    </Link>
  );
}
