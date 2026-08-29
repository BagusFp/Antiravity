import { notFound } from "next/navigation";
import Link from "next/link";
import { Film, Play, ChevronRight, Info, Compass } from "lucide-react";
import fallbackManager from "@/providers/fallback";
import VideoPlayerWrapper from "./VideoPlayerWrapper";
import EpisodePlaylist from "@/components/watch/EpisodePlaylist";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Utility to clean up episode titles by removing redundant parent anime title prefixes
const cleanEpisodeTitle = (epTitle: string, animeTitle: string, epNum: number) => {
  if (!epTitle) return `Episode ${epNum}`;
  
  let cleaned = epTitle;
  
  // Escape regex special chars and remove anime title from prefix
  const escapedAnimeTitle = animeTitle.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`^${escapedAnimeTitle}\\s*(-\\s*)?`, 'i');
  cleaned = cleaned.replace(regex, '');
  
  // Clean up common prefixes
  cleaned = cleaned.replace(/^\s*(episode|ep|eps)\s*/i, 'Episode ');
  
  // Fallback if empty
  if (!cleaned.trim()) {
    return `Episode ${epNum}`;
  }
  
  return cleaned.trim();
};

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
              animeId={parentDetails.id}
              animeTitle={parentDetails.title}
              episodeNumber={currentEpisodeNumber}
              episodeId={decodedEpisodeId}
              thumbnail={parentDetails.image}
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
          <EpisodePlaylist
            episodes={parentDetails.episodes}
            currentEpisodeNumber={currentEpisodeNumber}
            animeId={parentDetails.id}
            animeTitle={parentDetails.title}
          />
        </div>
      </div>
    </div>
  );
}
