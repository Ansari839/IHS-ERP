/**
 * 404 Not Found Page
 * 
 * Custom 404 page with branding and navigation.
 */

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion, Home } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <div className="flex flex-col items-center gap-4">
                        <FileQuestion className="h-16 w-16 text-muted-foreground" />
                        <CardTitle className="text-2xl text-center">Page Not Found</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-center text-muted-foreground">
                        The page you're looking for doesn't exist or has been moved.
                    </p>

                    <div className="flex justify-center pt-2">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Home className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
