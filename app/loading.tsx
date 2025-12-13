/**
 * Root Loading State
 * 
 * Displays while pages are loading.
 * Shows skeleton UI matching dashboard design.
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
    return (
        <div className="p-6">
            {/* Stats Grid Skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="h-4 w-24 bg-muted rounded" />
                                <div className="h-4 w-4 bg-muted rounded" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-20 bg-muted rounded mb-2" />
                            <div className="h-3 w-32 bg-muted rounded mb-2" />
                            <div className="h-3 w-full bg-muted rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Content Area Skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 animate-pulse">
                    <CardHeader>
                        <div className="h-6 w-32 bg-muted rounded" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between pb-3 border-b border-border last:border-0">
                                    <div className="space-y-2">
                                        <div className="h-4 w-40 bg-muted rounded" />
                                        <div className="h-3 w-24 bg-muted rounded" />
                                    </div>
                                    <div className="h-3 w-16 bg-muted rounded" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 animate-pulse">
                    <CardHeader>
                        <div className="h-6 w-28 bg-muted rounded" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-20 bg-muted rounded" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
