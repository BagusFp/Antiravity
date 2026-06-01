import { Film, Calendar } from "lucide-react";

export default function DetailLoading() {
  return (
    <div className="relative bg-[#0B0B0F] pb-20 min-h-screen">
      
      {/* Background Banner Blur Overlay Skeleton */}
      <div className="absolute top-0 left-0 w-full h-[45vh] sm:h-[55vh] overflow-hidden z-0">
        <div className="w-full h-full bg-[#12121A] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/70 to-transparent" />
      </div>

      {/* Main Metadata Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-20 space-y-12">
        
        {/* Info Column */}
        <div className="flex flex-col md:flex-row gap-8 sm:gap-12 items-start w-full">
          
          {/* Left Poster cover skeleton */}
          <div className="w-48 sm:w-64 mx-auto sm:mx-0 aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shrink-0 bg-[#12121A] relative shimmer-card" />

          {/* Right Text details skeleton */}
          <div className="space-y-6 flex-grow w-full">
            
            {/* Badges row skeleton */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-16 h-6 rounded-md bg-white/5 border border-white/5 shimmer-card" />
              <div className="w-20 h-6 rounded-md bg-white/5 border border-white/5 shimmer-card" />
              <div className="w-24 h-6 rounded-md bg-white/5 border border-white/5 shimmer-card" />
            </div>

            {/* Title block skeleton */}
            <div className="space-y-3">
              <div className="h-10 sm:h-12 w-3/4 rounded-xl bg-white/5 shimmer-card" />
              <div className="w-1/3 h-4 rounded-md bg-white/5 flex items-center space-x-1.5 opacity-60">
                <Calendar className="w-4 h-4 text-accent/50" />
                <div className="w-24 h-3 bg-white/5 rounded shimmer-card" />
              </div>
            </div>

            {/* Genres Tag block skeleton */}
            <div className="flex flex-wrap gap-2">
              <div className="w-16 h-7 rounded-full bg-white/5 border border-white/5 shimmer-card" />
              <div className="w-20 h-7 rounded-full bg-white/5 border border-white/5 shimmer-card" />
              <div className="w-14 h-7 rounded-full bg-white/5 border border-white/5 shimmer-card" />
              <div className="w-24 h-7 rounded-full bg-white/5 border border-white/5 shimmer-card" />
            </div>

            {/* Synopsis paragraph skeleton */}
            <div className="space-y-2.5 pt-2">
              <div className="w-24 h-4 bg-white/5 rounded shimmer-card" />
              <div className="w-full h-3.5 bg-white/5 rounded shimmer-card" />
              <div className="w-full h-3.5 bg-white/5 rounded shimmer-card" />
              <div className="w-5/6 h-3.5 bg-white/5 rounded shimmer-card" />
            </div>

            {/* Actions panel skeleton */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <div className="w-full sm:w-36 h-11 rounded-xl bg-white/5 border border-white/5 shimmer-card" />
              <div className="w-full sm:w-32 h-11 rounded-xl bg-white/5 border border-white/5 shimmer-card" />
            </div>
          </div>
        </div>

        {/* Episode Playlist Skeleton */}
        <section className="space-y-6 border-t border-white/5 pt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
              <Film className="w-6 h-6 text-accent/70" />
              <span>Episode Index</span>
            </h2>
            <div className="w-20 h-6 bg-white/5 rounded-md border border-white/5 shimmer-card" />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-12 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-11 rounded-lg bg-white/5 border border-white/5 shimmer-card"
              />
            ))}
          </div>
        </section>

        {/* Recommendations list skeleton */}
        <section className="space-y-6 border-t border-white/5 pt-10">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Related Recommendations
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <div className="aspect-[3/4] w-full rounded-xl bg-white/5 border border-white/5 shimmer-card" />
                <div className="h-4 bg-white/5 rounded-md w-3/4 shimmer-card" />
                <div className="h-3 bg-white/5 rounded-md w-1/2 shimmer-card" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
