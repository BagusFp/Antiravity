"use client";

import { X, RotateCcw } from "lucide-react";
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

export default function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}: FilterDrawerProps) {
  // Prevent body scroll when drawer/modal is open
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

  return (
    <>
      {/* Mobile Fullscreen Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-[#0C0C12] flex flex-col sm:hidden overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Refine Filters</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Customize your search results</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-white rounded-xl hover:bg-white/5 transition-all cursor-pointer"
              aria-label="Close filters"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Airing Status */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-accent/80">Airing Status</h3>
              <div className="grid grid-cols-2 gap-2">
                {STATUSES.map((s) => {
                  const active = filters.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => handleChange("status", s)}
                      className={`py-2.5 px-3 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer ${
                        active
                          ? "bg-accent/15 border-accent text-white shadow-lg shadow-accent/10"
                          : "bg-white/5 border-white/5 text-muted-foreground hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Format Type */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-accent/80">Format Type</h3>
              <div className="grid grid-cols-3 gap-2">
                {TYPES.map((t) => {
                  const active = filters.type === t;
                  return (
                    <button
                      key={t}
                      onClick={() => handleChange("type", t)}
                      className={`py-2.5 px-1 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer ${
                        active
                          ? "bg-accent/15 border-accent text-white shadow-lg shadow-accent/10"
                          : "bg-white/5 border-white/5 text-muted-foreground hover:text-white"
                      }`}
                    >
                      {t}
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
                          : "bg-white/5 border-white/5 text-muted-foreground hover:text-white"
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
          <div className="p-6 border-t border-white/5 bg-[#08080C] flex items-center justify-between gap-4 shrink-0">
            <button
              onClick={handleReset}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all text-center cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 transition-all text-center cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Desktop View: Backdrop & Drawer */}
      <div className="hidden sm:block">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-md transition-opacity duration-300 ${
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={onClose}
        />

        {/* Drawer */}
        <div
          className={`fixed z-50 bg-[#0C0C12]/95 backdrop-blur-xl shadow-2xl transition-transform duration-300 ease-out flex flex-col top-0 right-0 bottom-0 left-auto h-full w-full max-w-md border-l border-white/10 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Refine Filters</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Customize your search results</p>
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
            {/* Status */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-accent/80">Airing Status</h3>
              <div className="grid grid-cols-4 gap-2">
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
              <div className="grid grid-cols-5 gap-2">
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
            <button
              onClick={onClose}
              className="w-full py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-center cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
