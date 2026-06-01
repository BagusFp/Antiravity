"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Compass, SlidersHorizontal, Inbox, X, Loader2 } from "lucide-react";
import AnimeCard from "@/components/home/AnimeCard";
import { GridSkeleton } from "@/components/common/LoadingSkeleton";
import { AnimeSearchResult } from "@/types/anime";
import FilterDrawer, { FilterState, initialFilters } from "@/components/common/FilterDrawer";
import { applyFilters } from "@/utils/filter";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState<AnimeSearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Safe fetch lockouts to prevent overlapping or duplicate page fetches
  const isFetching = useRef(false);
  const fetchedPages = useRef<Set<string>>(new Set());
  
  // Safety counters to prevent loading loops when server returns no matching items
  const consecutiveEmptyPages = useRef(0);

  const fetchPage = async (pageNumber: number, searchQuery: string, activeFilters: FilterState, reset: boolean = false) => {
    const pageKey = `${searchQuery}:${JSON.stringify(activeFilters)}:${pageNumber}`;
    // Avoid redundant requests or fetching past bounds
    if (isFetching.current || (!reset && fetchedPages.current.has(pageKey))) return;
    if (!reset && pageNumber > 1 && !hasMore) return;

    isFetching.current = true;
    setIsLoading(true);
    
    try {
      const queryParams = new URLSearchParams({
        page: pageNumber.toString(),
        q: searchQuery,
        genre: activeFilters.genre,
        status: activeFilters.status,
        type: activeFilters.type,
        year: activeFilters.year,
        rating: activeFilters.rating,
        sortBy: activeFilters.sortBy,
      });

      const endpoint = `/api/search?${queryParams.toString()}`;

      const response = await fetch(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        
        let newAnime: AnimeSearchResult[] = [];
        let hasNext = false;
        
        // Handle both plain array fallback and paginated response schemas
        if (data && Array.isArray(data)) {
          newAnime = data;
          hasNext = false;
        } else if (data && Array.isArray(data.animeList)) {
          newAnime = data.animeList;
          const pag = data.pagination;
          if (pag) {
            hasNext = typeof pag.hasNextPage === "boolean" ? pag.hasNextPage : (pag.currentPage < pag.totalPages);
          } else {
            hasNext = false;
          }
        }
        
        fetchedPages.current.add(pageKey);
        
        const baseList = reset ? [] : items;
        const existingIds = new Set(baseList.map((i) => i.id));
        const uniqueNew = newAnime.filter((i) => !existingIds.has(i.id));

        // Loading Loop Safety Counter: count empty pages returning no new items
        if (uniqueNew.length === 0) {
          consecutiveEmptyPages.current += 1;
        } else {
          consecutiveEmptyPages.current = 0;
        }

        // hasMore becomes false if consecutive empty fetches reach limit of 5
        const nextHasMore = hasNext && consecutiveEmptyPages.current < 5;

        // DEBUG LOGGING (Requirement 7)
        console.log(`[Search Debug] Fetch Page Completed:
  - Current Filters: ${JSON.stringify(activeFilters)}
  - Current Page: ${pageNumber}
  - Total Results Received: ${newAnime.length} (Unique New: ${uniqueNew.length})
  - Next Page Availability: ${hasNext}
  - hasMore state: ${nextHasMore}`);
        
        setItems((prev) => {
          const prevList = reset ? [] : prev;
          const prevIds = new Set(prevList.map((i) => i.id));
          const filteredNew = uniqueNew.filter((i) => !prevIds.has(i.id));
          return [...prevList, ...filteredNew];
        });
        
        setHasMore(nextHasMore);
        setHasSearched(true);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("[Browse/Search Page] Failed to load catalog:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  };

  // Sync endpoint triggers: Reset Pagination properly when query OR filters change (Requirement 4)
  useEffect(() => {
    console.log(`[Search Page] Triggered Reset: Query="${initialQuery}", Filters=`, filters);
    setPage(1);
    setHasMore(true);
    consecutiveEmptyPages.current = 0;
    fetchedPages.current.clear();
    setItems([]);
    fetchPage(1, initialQuery, filters, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, filters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleClearSearch = () => {
    setQuery("");
    router.push("/search");
  };

  // Infinite scroll logic using IntersectionObserver (Requirement 2)
  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget || !hasMore || isLoading || isFetching.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching.current) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPage(nextPage, query, filters);
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
  }, [items, hasMore, isLoading, page, query, filters]);

  // Keep client-side filter mapping for instantaneous UI updates & resilience
  const filteredItems = applyFilters(items, filters);
  const activeFiltersCount = Object.entries(filters).filter(
    ([k, v]) => (k === "sortBy" ? v !== "Latest Update" : v !== "All")
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
      fetchPage(nextPage, query, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredItems.length, hasMore, isLoading, activeFiltersCount, page, query, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#0B0B0F]">
      
      {/* Header Info */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-3">
          <Compass className="w-8 h-8 text-accent animate-pulse" />
          <span>Browse Catalog</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Find your favorite shows from multiple integrated anime provider sources in real-time.
        </p>
      </div>

      {/* Input panel & Filters trigger */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSubmit} className="relative w-full md:max-w-2xl">
          <input
            type="text"
            placeholder="Type anime title, genre, studio..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-5 py-3 pl-12 pr-20 bg-muted/30 text-white placeholder-muted-foreground rounded-2xl border border-white/5 focus:outline-none focus:border-accent shadow-inner text-sm transition-all"
          />
          <Search className="w-5 h-5 text-muted-foreground absolute left-4.5 top-3.5" />
          
          {query.trim() && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-20 top-3 text-muted-foreground hover:text-white transition-all cursor-pointer mr-2"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="absolute right-2.5 top-1.5 px-4 py-1.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-semibold shadow-md shadow-accent/20 transition-all cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filter button */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:border-accent/40 text-muted-foreground hover:text-white transition-all text-sm font-semibold shrink-0 cursor-pointer"
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

      {/* Results grid container */}
      <div className="space-y-10 min-h-[50vh]">
        {filteredItems.length === 0 && isLoading ? (
          <GridSkeleton count={12} />
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 animate-fade-in">
            {filteredItems.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        ) : hasSearched && !isLoading ? (
          /* Empty state (Requirement 8) */
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 glass rounded-3xl border border-white/5 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
              <Inbox className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-wide">
                {items.length > 0 ? "No Filters Match" : "No Results Found"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs px-4">
                {items.length > 0 
                  ? "Try resetting or adjusting your filter constraints to see matches."
                  : `We couldn't find any matches${query ? ` for "${query}"` : ""}. Try a different query.`}
              </p>
            </div>
            {(items.length > 0 || activeFiltersCount > 0) && (
              <button
                onClick={() => setFilters(initialFilters)}
                className="mt-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : null}

        {/* Loading Indicator at Bottom */}
        {hasMore && (
          <div ref={observerTarget} className="py-12 flex flex-col items-center justify-center w-full space-y-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <span className="text-xs text-muted-foreground font-semibold tracking-wider uppercase animate-pulse">
                  Loading More Catalog...
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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <GridSkeleton count={12} />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
