/**
 * Root Middleware - Edge Authentication
 * 
 * Runs at the edge before route handlers load.
 * Protects API routes and dashboard pages.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Protected API routes
    if (pathname.startsWith('/api/protected')) {
        const authHeader = request.headers.get('authorization')

        if (!authHeader) {
            return NextResponse.json(
                {
                    success: false,
                    error: { message: 'Authorization header missing' }
                },
                { status: 401 }
            )
        }

        // Check for Bearer token format
        const parts = authHeader.split(' ')
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return NextResponse.json(
                {
                    success: false,
                    error: { message: 'Invalid authorization format. Use: Bearer <token>' }
                },
                { status: 401 }
            )
        }

        const token = parts[1]

        try {
            // Verify token at the edge
            verifyAccessToken(token)
            // Token is valid, continue to route handler
        } catch (error) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : 'Invalid or expired token'
                    }
                },
                { status: 401 }
            )
        }
    }

    // Protected dashboard routes (optional - for future use)
    if (pathname.startsWith('/dashboard')) {
        // Check for auth cookie
        const accessToken = request.cookies.get('accessToken')?.value

        if (!accessToken) {
            // Redirect to login page
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }

        try {
            verifyAccessToken(accessToken)
        } catch {
            // Invalid token, redirect to login
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/api/protected/:path*',
        '/dashboard/:path*',
    ]
}
