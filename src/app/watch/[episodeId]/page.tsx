import { notFound } from "next/navigation";
import Link from "next/link";
import { Film, Play, ChevronRight, Info, Compass } from "lucide-react";
import fallbackManager from "@/providers/fallback";
import VideoPlayerWrapper from "@/app/watch/[episodeId]/VideoPlayerWrapper";

export const revalidate = 600; // Cache stream lists for 10 minutes

interface PageProps {
  params: Promise<{ episodeId: string }>;
}

export default async function WatchPage({ params }: PageProps) {
  const { episodeId } = await params;

  if (!episodeId) {
    return notFound();
  }

  const decodedEpisodeId = decodeURIComponent(episodeId);

  // 1. Mathematically deduce parent ID and episode number
  let parentId = "";
  let currentEpisodeNumber = 1;

  if (decodedEpisodeId.includes("-episode-")) {
    const parts = decodedEpisodeId.split("-episode-");
    parentId = parts[0];
    currentEpisodeNumber = parseFloat(parts[1]) || 1;
  } else if (decodedEpisodeId.includes("-episode")) {
    const parts = decodedEpisodeId.split("-episode");
    parentId = parts[0];
    currentEpisodeNumber = parseFloat(parts[1]) || 1;
  } else {
    // Fallback if ID is flat (Gogoanime direct format)
    parentId = decodedEpisodeId.replace(/-episode-\d+$/, "");
  }

  let streamSource = null;
  let parentDetails;
  let errorMsg: string | null = null;

  try {
    // 1. Fetch stream sources first to get the correct parent animeId from Sanka API
    try {
      streamSource = await fallbackManager.getStreamSources(decodedEpisodeId);
      if (streamSource && streamSource.animeId) {
        parentId = streamSource.animeId;
      }
    } catch (err: any) {
      console.error("Failed loading stream sources on watch page:", err);
      errorMsg = err.message || "Failed to extract active stream from all providers.";
    }

    // 2. Fetch parent details using the resolved parentId
    parentDetails = await fallbackManager.getAnimeDetail(parentId).catch((err) => {
      console.warn("Failed fetching parent details on watch page. Creating fallback:", err);
      return {
        id: parentId,
        title: parentId.replace(/-/g, " ").replace("samehadaku:", ""),
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80",
        genres: [],
        synopsis: "",
        episodes: [{ id: decodedEpisodeId, number: currentEpisodeNumber, title: `Episode ${currentEpisodeNumber}` }],
      } as any;
    });
  } catch (error) {
    console.error("Fatal error loading watch page metadata:", error);
    return notFound();
  }

  // 3. Find next episode for Autoplay countdown support
  const nextEp = parentDetails.episodes.find((ep: any) => ep.number === currentEpisodeNumber + 1);
  const nextEpisodeId = nextEp ? nextEp.id : null;

  return (
    <div className="bg-[#0B0B0F] min-h-screen pb-16">
      
      {/* Dynamic breadcrumb path indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground border-b border-white/5">
        <Link href="/" className="hover:text-white flex items-center space-x-1.5 transition-colors">
          <Compass className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href={`/anime/${encodeURIComponent(parentDetails.id)}`}
          className="hover:text-white transition-colors truncate max-w-[200px]"
        >
          {parentDetails.title}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white font-semibold">
          Episode {currentEpisodeNumber}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Widescreen Theater Mode Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Video Stream Container (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Custom video component wrapper */}
            <VideoPlayerWrapper
              streamSource={streamSource}
              nextEpisodeId={nextEpisodeId}
              errorMsg={errorMsg}
            />

            {/* Active Episode Description Info */}
            <div className="p-6 rounded-2xl bg-muted/20 border border-white/5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide leading-tight">
                    {parentDetails.title} - Episode {currentEpisodeNumber}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Format: Adaptive M3U8 HLS &bull; Ads Status: Zero Ads &bull; Platform Server: Auto Fallback Node
                  </p>
                </div>
                <Link
                  href={`/anime/${encodeURIComponent(parentDetails.id)}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 transition-all text-sm font-semibold shrink-0"
                >
                  <Info className="w-4 h-4" />
                  <span>Show Details</span>
                </Link>
              </div>

              {parentDetails.synopsis && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {parentDetails.synopsis}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar Playlist Panel (4 Columns) */}
          <div className="lg:col-span-4 rounded-2xl bg-muted/20 border border-white/5 overflow-hidden flex flex-col max-h-[600px]">
            <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2 text-white">
                <Film className="w-5 h-5 text-accent" />
                <h3 className="font-bold text-sm tracking-wide uppercase">
                  Episode List
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {parentDetails.episodes.length} Airing
              </span>
            </div>

            {/* Scrollable List Playlist */}
            <div className="divide-y divide-white/5 overflow-y-auto pr-1">
              {parentDetails.episodes.map((ep: any) => {
                const isActive = ep.number === currentEpisodeNumber;
                return (
                  <Link
                    key={ep.id}
                    href={`/watch/${encodeURIComponent(ep.id)}`}
                    className={`flex items-center justify-between px-4 py-3.5 transition-all text-sm group ${
                      isActive
                        ? "bg-accent/15 border-l-4 border-accent text-accent font-bold"
                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="truncate pr-4">
                      {ep.title || `Episode ${ep.number}`}
                    </span>
                    <div className="flex items-center shrink-0">
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
        </div>
      </div>
    </div>
  );
}
