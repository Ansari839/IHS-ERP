'use client'

/**
 * Error Boundary for Posts Section
 * 
 * Catches errors in the posts section without crashing the entire app.
 */

import { useEffect } from 'react'
import { AlertCircle } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Posts error:', error)
    }, [error])

    return (
        <div className="p-6">
            <div className="flex items-center gap-2 text-destructive mb-4">
                <AlertCircle className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Failed to load posts</h2>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
                {error.message || 'An error occurred while loading posts.'}
            </p>

            <button
                onClick={reset}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
                Try again
            </button>
        </div>
    )
}
