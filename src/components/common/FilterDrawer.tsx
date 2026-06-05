"use client";

import { X, RotateCcw, Check } from "lucide-react";
import { useEffect } from "react";

export interface FilterState {
  genre: string;
  status: string;
  type: string;
  year: string;
  rating: string;
  sortBy: string;
}

export const initialFilters: FilterState = {
  genre: "All",
  status: "All",
  type: "All",
  year: "All",
  rating: "All",
  sortBy: "Latest Update",
};

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
}

const GENRES = [
  "All",
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Supernatural",
  "Mystery",
  "Sports",
  "Mecha",
  "Isekai",
  "Shounen",
  "Suspense",
];

const STATUSES = ["All", "Ongoing", "Completed", "Upcoming"];
const TYPES = ["All", "TV", "Movie", "OVA", "Special"];
const RATINGS = ["All", "9.0+", "8.0+", "7.0+", "6.0+"];
const SORTS = ["Latest Update", "Most Popular", "Highest Rated", "A-Z"];
const YEARS = [
  "All",
  "2026",
  "2025",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
  "2010s",
  "2000s",
  "Older",
];

export default function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}: FilterDrawerProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleChange = (key: keyof FilterState, value: string) => {
    onApplyFilters({
      ...filters,
      [key]: value,
    });
  };

  const handleReset = () => {
    onApplyFilters(initialFilters);
  };

  const activeFiltersCount = Object.entries(filters).filter(
    ([k, v]) => (k === "sortBy" ? v !== "Latest Update" : v !== "All")
  ).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-md transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer / Bottom Sheet */}
      <div
        className={`fixed z-50 bg-[#0C0C12]/95 backdrop-blur-xl shadow-2xl transition-transform duration-300 ease-out flex flex-col bottom-0 left-0 right-0 top-auto w-full h-[85dvh] max-h-[85dvh] rounded-t-[2rem] border-t border-white/10 sm:top-0 sm:right-0 sm:bottom-0 sm:left-auto sm:h-full sm:max-h-screen sm:w-full sm:max-w-md sm:rounded-t-none sm:border-l sm:border-t-0 ${
          isOpen ? "translate-y-0 sm:translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"
        }`}
      >
        {/* Mobile drag handle */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden shrink-0">
          <div className="w-12 h-1.5 bg-white/10 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Refine Filters</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Customize your anime feed</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="p-2 text-muted-foreground hover:text-white rounded-xl hover:bg-white/5 transition-all text-xs flex items-center space-x-1 font-medium cursor-pointer"
              title="Reset All Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-white rounded-xl hover:bg-white/5 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 no-scrollbar">
          {/* Sort By */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-accent/80">Sort Results By</h3>
            <div className="grid grid-cols-2 gap-2">
              {SORTS.map((s) => {
                const active = filters.sortBy === s;
                return (
                  <button
                    key={s}
                    onClick={() => handleChange("sortBy", s)}
                    className={`py-2.5 px-3 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                      active
                        ? "bg-accent/15 border-accent text-white shadow-lg shadow-accent/10"
                        : "bg-white/5 border-white/5 text-muted-foreground hover:text-white hover:border-white/10"
                    }`}
                  >
                    <span>{s}</span>
                    {active && <Check className="w-3.5 h-3.5 text-accent animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-accent/80">Airing Status</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STATUSES.map((s) => {
                const active = filters.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => handleChange("status", s)}
                    className={`py-2 px-3 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer ${
                      active
                        ? "bg-accent/15 border-accent text-white shadow-lg shadow-accent/10"
                        : "bg-white/5 border-white/5 text-muted-foreground hover:text-white hover:border-white/10"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-accent/80">Format Type</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {TYPES.map((t) => {
                const active = filters.type === t;
                return (
                  <button
                    key={t}
                    onClick={() => handleChange("type", t)}
                    className={`py-2 px-1 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer ${
                      active
                        ? "bg-accent/15 border-accent text-white shadow-lg shadow-accent/10"
                        : "bg-white/5 border-white/5 text-muted-foreground hover:text-white hover:border-white/10"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-accent/80">Minimum Rating</h3>
            <div className="grid grid-cols-5 gap-2">
              {RATINGS.map((r) => {
                const active = filters.rating === r;
                return (
                  <button
                    key={r}
                    onClick={() => handleChange("rating", r)}
                    className={`py-2 px-1 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer ${
                      active
                        ? "bg-accent/15 border-accent text-white shadow-lg shadow-accent/10"
                        : "bg-white/5 border-white/5 text-muted-foreground hover:text-white hover:border-white/10"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Release Year */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-accent/80">Release Year</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {YEARS.map((y) => {
                const active = filters.year === y;
                return (
                  <button
                    key={y}
                    onClick={() => handleChange("year", y)}
                    className={`py-2 px-2 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer ${
                      active
                        ? "bg-accent/15 border-accent text-white shadow-lg shadow-accent/10"
                        : "bg-white/5 border-white/5 text-muted-foreground hover:text-white hover:border-white/10"
                    }`}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Genre Selection */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-accent/80">Filter by Genre</h3>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => {
                const active = filters.genre === g;
                return (
                  <button
                    key={g}
                    onClick={() => handleChange("genre", g)}
                    className={`py-1.5 px-3 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      active
                        ? "bg-accent text-white border-accent shadow-md shadow-accent/25"
                        : "bg-white/5 border-white/5 text-muted-foreground hover:text-white hover:border-white/10"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-white/5 bg-[#08080C]/80 backdrop-blur-md flex items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            {activeFiltersCount} Active Filters
          </div>
          <button
            onClick={onClose}
            className="flex-1 max-w-[200px] py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-center cursor-pointer"
          >
            Apply & View
          </button>
        </div>
      </div>
    </>
  );
}
