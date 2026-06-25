import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-96" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 w-full lg:col-span-2" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
