"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Compass, SlidersHorizontal, Inbox } from "lucide-react";
import AnimeCard from "@/components/home/AnimeCard";
import { GridSkeleton } from "@/components/common/LoadingSkeleton";
import { AnimeSearchResult } from "@/types/anime";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<AnimeSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchResults = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  // Trigger search on mount if url query exists
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      fetchResults(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      fetchResults(query);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#0B0B0F]">
      
      {/* Header Info */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-3">
          <Compass className="w-8 h-8 text-accent" />
          <span>Browse Catalog</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Find your favorite shows from multiple integrated anime provider sources in real-time.
        </p>
      </div>

      {/* Input panel & Filters mock */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSubmit} className="relative w-full md:max-w-2xl">
          <input
            type="text"
            placeholder="Type anime title, genre, studio..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-5 py-3 pl-12 bg-muted/30 text-white placeholder-muted-foreground rounded-2xl border border-white/5 focus:outline-none focus:border-accent shadow-inner text-sm transition-all"
          />
          <Search className="w-5 h-5 text-muted-foreground absolute left-4.5 top-3.5" />
          <button
            type="submit"
            className="absolute right-2.5 top-1.5 px-4 py-1.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-semibold shadow-md shadow-accent/20 transition-all"
          >
            Search
          </button>
        </form>

        {/* Filter tags mock */}
        <button className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:border-accent/40 text-muted-foreground hover:text-white transition-all text-sm font-semibold shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Refine Filters</span>
        </button>
      </div>

      {/* Results grid container */}
      <div className="space-y-6">
        {isLoading ? (
          <GridSkeleton count={12} />
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {results.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        ) : hasSearched ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 glass rounded-3xl border border-white/5 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
              <Inbox className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-wide">No Results Found</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                We couldn&apos;t find any matches for &ldquo;{query}&rdquo;. Double-check the spelling or try a different term.
              </p>
            </div>
          </div>
        ) : (
          /* Initial State - Show suggestions */
          <div className="text-center py-16 text-muted-foreground">
            Type in the search bar above to query shows dynamically.
          </div>
        )}
      </div>
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
