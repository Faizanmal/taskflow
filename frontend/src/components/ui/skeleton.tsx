export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
    />
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
