export default function Loading() {
  return (
    <div className="bg-[#0B0B0F] min-h-screen pb-16 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-white/5 flex items-center space-x-2">
        <div className="w-16 h-4 bg-white/5 rounded-full" />
        <div className="w-4 h-4 bg-white/5 rounded-full" />
        <div className="w-32 h-4 bg-white/5 rounded-full" />
        <div className="w-4 h-4 bg-white/5 rounded-full" />
        <div className="w-20 h-4 bg-white/5 rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Player Skeleton */}
          <div className="lg:col-span-8 space-y-6">
            <div className="w-full aspect-video rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <div className="text-sm font-semibold text-white/40 tracking-wider">
                Preparing High-Speed Stream...
              </div>
            </div>

            {/* Description Skeleton */}
            <div className="p-6 rounded-2xl bg-muted/20 border border-white/5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="w-64 h-6 bg-white/5 rounded" />
                  <div className="w-48 h-3 bg-white/5 rounded" />
                </div>
                <div className="w-28 h-10 bg-white/5 rounded-lg" />
              </div>
              <div className="space-y-2 pt-2">
                <div className="w-full h-4 bg-white/5 rounded" />
                <div className="w-5/6 h-4 bg-white/5 rounded" />
              </div>
            </div>
          </div>

          {/* Sidebar Playlist Skeleton */}
          <div className="lg:col-span-4 rounded-2xl bg-muted/20 border border-white/5 overflow-hidden flex flex-col min-h-[400px]">
            <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="w-28 h-5 bg-white/5 rounded" />
              <div className="w-12 h-4 bg-white/5 rounded" />
            </div>
            <div className="p-4 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="w-3/4 h-5 bg-white/5 rounded" />
                  <div className="w-6 h-6 bg-white/5 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
