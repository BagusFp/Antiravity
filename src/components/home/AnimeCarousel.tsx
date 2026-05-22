"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AnimeCard from "./AnimeCard";
import { AnimeSearchResult } from "@/types/anime";
import Link from "next/link";

interface AnimeCarouselProps {
  title: string;
  items: AnimeSearchResult[];
  viewMoreHref?: string;
}

export default function AnimeCarousel({ title, items, viewMoreHref }: AnimeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollLimits = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener("scroll", checkScrollLimits);
      // Run once initially
      checkScrollLimits();
    }
    return () => scrollEl?.removeEventListener("scroll", checkScrollLimits);
  }, [items]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative group/carousel space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between px-4 sm:px-0">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white border-l-4 border-accent pl-3">
          {title}
        </h2>
        {viewMoreHref && (
          <Link
            href={viewMoreHref}
            className="text-xs sm:text-sm font-bold text-accent hover:text-white transition-all px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 hover:bg-accent shadow-lg shadow-accent/5"
          >
            View More
          </Link>
        )}
      </div>

      {/* Outer Container with arrows */}
      <div className="relative">
        {/* Left scroll button */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/70 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 shadow-md shadow-black/80 hover:bg-accent hover:border-accent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right scroll button */}
        {showRightArrow && (
          <button
            onClick={() => handleScroll("right")}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/70 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 shadow-md shadow-black/80 hover:bg-accent hover:border-accent"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Scrollable grid container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto space-x-4 sm:space-x-6 py-4 px-4 sm:px-0 no-scrollbar select-none"
        >
          {items.map((anime) => (
            <div
              key={anime.id}
              className="w-[140px] sm:w-[170px] md:w-[190px] shrink-0"
            >
              <AnimeCard anime={anime} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
