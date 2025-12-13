'use client'

/**
 * Root Error Boundary
 * 
 * Catches all unhandled errors in the application.
 * Provides user-friendly error messages and retry functionality.
 */

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application error:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-6 w-6" />
                        <CardTitle>Something went wrong!</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        An unexpected error occurred. This has been logged and we'll look into it.
                    </p>

                    {error.message && (
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs font-mono text-muted-foreground">
                                {error.message}
                            </p>
                        </div>
                    )}

                    {error.digest && (
                        <p className="text-xs text-muted-foreground">
                            Error ID: {error.digest}
                        </p>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={reset}
                            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Try again
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                        >
                            Go home
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
