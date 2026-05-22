import Link from "next/link";
import { Play, Info, Calendar, Star } from "lucide-react";
import { AnimeSearchResult } from "@/types/anime";

interface HeroBannerProps {
  featured: AnimeSearchResult;
}

export default function HeroBanner({ featured }: HeroBannerProps) {
  const { id, title, image, rating, genres = ["Action", "Sci-Fi", "Mecha"] } = featured;

  return (
    <div className="relative w-full h-[65vh] sm:h-[80vh] bg-[#07070A] overflow-hidden flex items-end">
      {/* Background Poster Cover */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1920&q=80"
          alt={title}
          className="w-full h-full object-cover object-center transform scale-100 animate-[pulse_10s_infinite_alternate]"
        />
        {/* Gradients to fade cover edges */}
        <div className="absolute inset-0 hero-gradient-overlay z-1" />
        <div className="absolute inset-0 hero-side-overlay z-1" />
      </div>

      {/* Hero Contents */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12 sm:pb-20 space-y-6">
        
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-accent/20 text-accent font-bold text-xs uppercase tracking-widest border border-accent/30 shadow-md">
            Featured
          </span>
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded bg-black/60 text-yellow-500 font-bold text-xs border border-white/5 backdrop-blur-md">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{rating || "9.1"} Rating</span>
          </div>
        </div>

        {/* Cinematic Title */}
        <div className="max-w-2xl space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-lg drop-shadow-black">
            {title}
          </h1>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 pt-1 text-sm text-muted-foreground">
            {genres.map((genre, idx) => (
              <span key={genre} className="flex items-center">
                {idx > 0 && <span className="mx-2 text-white/20">&bull;</span>}
                <span className="hover:text-white transition-colors">{genre}</span>
              </span>
            ))}
          </div>

          {/* Description mock */}
          <p className="hidden md:block text-muted-foreground text-sm leading-relaxed max-w-xl drop-shadow-md drop-shadow-black">
            In a futuristic city, humanity stands on the brink of extinction against massive extraterrestrial forces. MAG brings you this masterpiece completely ad-free in crystal-clear high-definition with multiple streaming fallback options.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {/* Watch Direct Button */}
          <Link
            href={`/watch/${encodeURIComponent(`${id}-episode-1`)}`}
            className="flex items-center space-x-2 px-6 py-3 rounded-full bg-accent text-white font-semibold shadow-lg shadow-accent/20 hover:bg-accent-hover hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Watch Episode 1</span>
          </Link>

          {/* Info Details Button */}
          <Link
            href={`/anime/${encodeURIComponent(id)}`}
            className="flex items-center space-x-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/10 hover:scale-105 active:scale-95 transition-all duration-200 backdrop-blur-md"
          >
            <Info className="w-5 h-5" />
            <span>View Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
