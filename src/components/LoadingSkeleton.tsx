
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

export function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Professional Spinning Logo */}
      <Spinner size="xl" withLogo={true} />
      
      {/* Loading Text */}
      <div className="text-center space-y-2">
        <p className="text-white text-xl font-semibold animate-pulse">Loading...</p>
        <p className="text-gray-400 text-sm">Please wait while we prepare your experience</p>
      </div>
    </div>
  )
}

export function UserDashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-32" />
      <Skeleton className="h-24" />
      <Skeleton className="h-48" />
    </div>
  )
}
