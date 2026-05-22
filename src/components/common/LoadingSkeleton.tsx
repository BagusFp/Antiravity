export function CardSkeleton() {
  return (
    <div className="flex flex-col space-y-3 animate-pulse">
      <div className="aspect-[3/4] w-full rounded-xl bg-muted/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      </div>
      <div className="h-4 bg-muted/60 rounded-md w-3/4" />
      <div className="h-3 bg-muted/40 rounded-md w-1/2" />
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-pulse">
      <div className="flex flex-col md:flex-row gap-8 items-start w-full">
        <div className="w-48 sm:w-64 aspect-[3/4] bg-muted/60 rounded-2xl shrink-0 mx-auto sm:mx-0" />
        <div className="space-y-4 flex-grow w-full">
          <div className="h-8 bg-muted/60 rounded-md w-1/2" />
          <div className="flex gap-2">
            <div className="h-6 bg-muted/40 rounded-full w-16" />
            <div className="h-6 bg-muted/40 rounded-full w-20" />
            <div className="h-6 bg-muted/40 rounded-full w-14" />
          </div>
          <div className="space-y-2 pt-4">
            <div className="h-4 bg-muted/40 rounded-md w-full" />
            <div className="h-4 bg-muted/40 rounded-md w-full" />
            <div className="h-4 bg-muted/40 rounded-md w-2/3" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-6 bg-muted/60 rounded-md w-36" />
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted/40 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
