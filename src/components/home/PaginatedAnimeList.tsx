"use client";

import { useState, useEffect, useRef } from "react";
import { Compass, Inbox, ArrowUp, Loader2 } from "lucide-react";
import AnimeCard from "@/components/home/AnimeCard";
import { GridSkeleton } from "@/components/common/LoadingSkeleton";
import { AnimeSearchResult } from "@/types/anime";

interface PaginatedAnimeListProps {
  title: string;
  description: string;
  apiEndpoint: string;
}

export default function PaginatedAnimeList({
  title,
  description,
  apiEndpoint,
}: PaginatedAnimeListProps) {
  const [items, setItems] = useState<AnimeSearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Safe fetch lockouts to prevent overlapping or duplicate page fetches
  const isFetching = useRef(false);
  const fetchedPages = useRef<Set<number>>(new Set());

  const fetchPage = async (pageNumber: number) => {
    // Avoid redundant requests or fetching past bounds
    if (isFetching.current || fetchedPages.current.has(pageNumber)) return;
    if (pageNumber > 1 && !hasMore) return;

    isFetching.current = true;
    setIsLoading(true);
    
    try {
      console.log(`[PaginatedAnimeList] Requesting page ${pageNumber} from ${apiEndpoint}`);
      const response = await fetch(`${apiEndpoint}?page=${pageNumber}`);
      if (response.ok) {
        const data = await response.json();
        
        let newAnime: AnimeSearchResult[] = [];
        let hasNext = false;
        
        // Resilience: handle both plain array fallback and paginated response schemas
        if (data && Array.isArray(data)) {
          newAnime = data;
          hasNext = data.length > 0;
        } else if (data && Array.isArray(data.animeList)) {
          newAnime = data.animeList;
          const pag = data.pagination;
          // Set true availability from next page metadata or pages comparison
          if (pag) {
            hasNext = typeof pag.hasNextPage === "boolean" ? pag.hasNextPage : (pag.currentPage < pag.totalPages);
          } else {
            hasNext = false;
          }
        }
        
        if (newAnime.length === 0 && !hasNext) {
          setHasMore(false);
        } else {
          fetchedPages.current.add(pageNumber);
          setItems((prev) => {
            // Guarantee deduplication of anime IDs
            const existingIds = new Set(prev.map((i) => i.id));
            const uniqueNew = newAnime.filter((i) => !existingIds.has(i.id));
            return [...prev, ...uniqueNew];
          });
          setHasMore(hasNext);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("[PaginatedAnimeList] Failed to load paginated anime:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  };

  // Fetch initial page
  useEffect(() => {
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll logic using IntersectionObserver
  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget || !hasMore || isLoading || isFetching.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Detect scroll near bottom and trigger page fetch
        if (entries[0].isIntersecting && !isFetching.current) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPage(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentTarget);

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, hasMore, isLoading, page]);

  // Monitor scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#0B0B0F]">
      {/* Header Info */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-3">
          <Compass className="w-8 h-8 text-accent animate-pulse" />
          <span>{title}</span>
        </h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Grid container */}
      <div className="space-y-10 min-h-[50vh]">
        {items.length === 0 && isLoading ? (
          <GridSkeleton count={12} />
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-fade-in">
            {items.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 glass rounded-3xl border border-white/5 max-w-xl mx-auto animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
              <Inbox className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-wide">No Anime Found</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                We couldn&apos;t find any records for this category right now.
              </p>
            </div>
          </div>
        )}

        {/* Loading Indicator at Bottom */}
        {hasMore && (
          <div ref={observerTarget} className="py-12 flex flex-col items-center justify-center w-full space-y-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <span className="text-xs text-muted-foreground font-semibold tracking-wider uppercase animate-pulse">
                  Loading More Series...
                </span>
              </div>
            )}
          </div>
        )}

        {/* End of content indicator */}
        {!hasMore && items.length > 0 && (
          <div className="text-center py-8 text-xs font-bold tracking-widest text-muted-foreground uppercase border-t border-white/5 animate-fade-in">
            You&apos;ve reached the end of the collection
          </div>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/30 transition-all hover:scale-110 active:scale-95 animate-fade-in border border-white/10"
          title="Scroll to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
