"use client";

import { useState, useEffect, useRef } from "react";
import { Compass, Inbox, ArrowUp, Loader2, SlidersHorizontal, X } from "lucide-react";
import AnimeCard from "@/components/home/AnimeCard";
import { GridSkeleton } from "@/components/common/LoadingSkeleton";
import { AnimeSearchResult } from "@/types/anime";
import FilterDrawer, { FilterState, initialFilters } from "@/components/common/FilterDrawer";
import { applyFilters } from "@/utils/filter";

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
  
  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  
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

  // Apply filters client-side
  const filteredItems = applyFilters(items, filters);
  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== "All" && v !== "Latest Update"
  ).length;

  // Auto-pagination trigger when filters result in sparse list but more API content is available
  useEffect(() => {
    if (
      activeFiltersCount > 0 &&
      filteredItems.length < 12 &&
      hasMore &&
      !isLoading &&
      !isFetching.current
    ) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPage(nextPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredItems.length, hasMore, isLoading, activeFiltersCount, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#0B0B0F]">
      {/* Header Info & Filter Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-3">
            <Compass className="w-8 h-8 text-accent animate-pulse" />
            <span>{title}</span>
          </h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Filter button */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:border-accent/40 text-muted-foreground hover:text-white transition-all text-sm font-semibold shrink-0 cursor-pointer self-start md:self-center"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Refine Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold animate-scale-in">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Active Filter Badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center text-xs bg-white/5 p-3.5 rounded-2xl border border-white/5 animate-fade-in">
          <span className="text-muted-foreground font-semibold uppercase tracking-wider">Active Filters:</span>
          {Object.entries(filters).map(([key, val]) => {
            if (key === "sortBy" && val === "Latest Update") return null;
            if (key !== "sortBy" && val === "All") return null;
            
            return (
              <span
                key={key}
                className="flex items-center space-x-1.5 py-1.5 px-3 rounded-full bg-accent/15 border border-accent/20 text-white font-medium capitalize"
              >
                <span className="text-muted-foreground lowercase">{key}:</span>
                <span>{val}</span>
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, [key]: key === "sortBy" ? "Latest Update" : "All" }))}
                  className="text-white/60 hover:text-white ml-1 cursor-pointer focus:outline-none"
                  title={`Remove ${key} filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          <button
            onClick={() => setFilters(initialFilters)}
            className="ml-auto py-1 px-3 text-accent hover:text-accent-hover font-bold hover:underline cursor-pointer transition-all"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Grid container */}
      <div className="space-y-10 min-h-[50vh]">
        {filteredItems.length === 0 && isLoading ? (
          <GridSkeleton count={12} />
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 animate-fade-in">
            {filteredItems.map((anime) => (
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
              <h3 className="text-lg font-bold text-white tracking-wide">
                {items.length > 0 ? "No Filters Match" : "No Anime Found"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs px-4">
                {items.length > 0
                  ? "Try resetting or adjusting your filter constraints to see matches."
                  : "We couldn't find any records for this category right now."}
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={() => setFilters(initialFilters)}
                className="mt-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            )}
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
        {!hasMore && filteredItems.length > 0 && (
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

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
      />
    </div>
  );
}
