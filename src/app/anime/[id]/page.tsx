import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Play, Calendar, Film, Bookmark, Share2 } from "lucide-react";
import fallbackManager from "@/providers/fallback";
import AnimeCard from "@/components/home/AnimeCard";

// Dynamic routing page revalidation
export const revalidate = 3600; // Cache individual details for 1 hour

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnimeDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  const decodedId = decodeURIComponent(id);
  
  let detail: any;
  let recommendations: any[] = [];

  try {
    detail = await fallbackManager.getAnimeDetail(decodedId);
    try {
      recommendations = await fallbackManager.getRecommendations(decodedId);
    } catch (e) {
      console.warn("Failed fetching recommendations on details page, defaulting to empty:", e);
    }
  } catch (error) {
    console.error("Failed to load details for id:", decodedId, error);
    return notFound();
  }

  return (
    <div className="relative bg-[#0B0B0F] pb-20">
      
      {/* Background Banner Blur Overlay */}
      <div className="absolute top-0 left-0 w-full h-[45vh] sm:h-[55vh] overflow-hidden z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={detail.image}
          alt={detail.title}
          className="w-full h-full object-cover object-center blur-2xl opacity-20 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/70 to-transparent" />
      </div>

      {/* Main Metadata Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-20 space-y-12">
        
        {/* Info Column */}
        <div className="flex flex-col md:flex-row gap-8 sm:gap-12 items-start">
          
          {/* Left Poster cover */}
          <div className="w-full sm:w-64 aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shrink-0 bg-muted/20 relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={detail.image}
              alt={detail.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Right Text details */}
          <div className="space-y-6 flex-grow">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              {detail.rating && (
                <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{detail.rating}</span>
                </div>
              )}
              {detail.status && (
                <div className="px-2.5 py-1 rounded-md bg-accent/10 text-accent border border-accent/20 text-xs font-bold uppercase tracking-wider">
                  {detail.status}
                </div>
              )}
              {detail.studio && (
                <div className="px-2.5 py-1 rounded-md bg-white/5 text-muted-foreground border border-white/5 text-xs">
                  {detail.studio}
                </div>
              )}
            </div>

            {/* Title block */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {detail.title}
              </h1>
              {detail.releasedDate && (
                <p className="text-sm text-muted-foreground flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>Aired: {detail.releasedDate}</span>
                </p>
              )}
            </div>

            {/* Genres Tag block */}
            <div className="flex flex-wrap gap-2">
              {detail.genres.map((genre: string) => (
                <Link
                  key={genre}
                  href={`/search?q=${encodeURIComponent(genre)}`}
                  className="px-3 py-1 rounded-full bg-white/5 text-sm text-white/95 border border-white/5 hover:border-accent hover:text-accent transition-colors"
                >
                  {genre}
                </Link>
              ))}
            </div>

            {/* Synopsis paragraph */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white tracking-wide">Synopsis</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl">
                {detail.synopsis || "No synopsis available."}
              </p>
            </div>

            {/* Actions panel */}
            <div className="flex flex-wrap gap-3 pt-2">
              {detail.episodes.length > 0 && (
                <Link
                  href={`/watch/${encodeURIComponent(detail.episodes[0].id)}`}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold shadow-lg shadow-accent/20 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Watching</span>
                </Link>
              )}
              <button className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/5 transition-all">
                <Bookmark className="w-4 h-4" />
                <span>Bookmark</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Episodes Playlist Section */}
        <section className="space-y-6 border-t border-white/5 pt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
              <Film className="w-6 h-6 text-accent" />
              <span>Episode Index</span>
            </h2>
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">
              {detail.episodes.length} Episodes
            </span>
          </div>

          {detail.episodes.length === 0 ? (
            <div className="p-8 glass rounded-2xl text-center text-muted-foreground">
              No episodes have been released yet for this show.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-12 gap-3 max-h-[300px] overflow-y-auto pr-2">
              {detail.episodes.map((episode: any) => (
                <Link
                  key={episode.id}
                  href={`/watch/${encodeURIComponent(episode.id)}`}
                  className="flex items-center justify-center h-11 rounded-lg bg-muted/40 text-sm font-semibold border border-white/5 text-white/90 hover:bg-accent hover:border-accent hover:scale-[1.03] transition-all"
                  title={episode.title || `Episode ${episode.number}`}
                >
                  {episode.number}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Context Recommendations List */}
        {recommendations.length > 0 && (
          <section className="space-y-6 border-t border-white/5 pt-10">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Related Recommendations
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {recommendations.slice(0, 6).map((rec: any) => (
                <AnimeCard key={rec.id} anime={rec} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
