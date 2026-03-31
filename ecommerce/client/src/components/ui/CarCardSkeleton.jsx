export default function CarCardSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="aspect-[4/3] bg-surface-card" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-3/4 rounded bg-surface-card" />
            <div className="h-6 w-1/2 rounded bg-surface-card" />
            <div className="flex gap-3">
              <div className="h-3 w-12 rounded bg-surface-card" />
              <div className="h-3 w-16 rounded bg-surface-card" />
              <div className="h-3 w-14 rounded bg-surface-card" />
              <div className="h-3 w-10 rounded bg-surface-card" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="h-3 w-20 rounded bg-surface-card" />
              <div className="h-8 w-24 rounded-lg bg-surface-card" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
