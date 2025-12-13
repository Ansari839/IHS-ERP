/**
 * Loading State for Posts Section
 * 
 * Displays skeleton UI while posts are loading.
 */

export default function Loading() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="h-8 w-32 bg-muted rounded animate-pulse" />
            </div>

            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 border border-border rounded-lg animate-pulse">
                        <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                        <div className="h-4 w-full bg-muted rounded mb-2" />
                        <div className="flex items-center gap-4 mt-3">
                            <div className="h-3 w-24 bg-muted rounded" />
                            <div className="h-3 w-20 bg-muted rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
