/**
 * Root Middleware - Edge Authentication
 * 
 * Runs at the edge before route handlers load.
 * Protects API routes and dashboard pages.
 * Handles smart redirects based on auth state.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'

/**
 * Check if user is authenticated
 */
function isAuthenticated(request: NextRequest): boolean {
    const accessToken = request.cookies.get('accessToken')?.value

    if (!accessToken) {
        return false
    }

    try {
        verifyAccessToken(accessToken)
        return true
    } catch {
        return false
    }
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    const authenticated = isAuthenticated(request)

    // 1. Handle login page
    if (pathname === '/login') {
        if (authenticated) {
            // Already logged in, redirect to dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        // Not logged in, show login page
        return NextResponse.next()
    }

    // 2. Protected API routes
    if (pathname.startsWith('/api/protected')) {
        if (!authenticated) {
            return NextResponse.json(
                {
                    success: false,
                    error: { message: 'Authorization required' }
                },
                { status: 401 }
            )
        }
        return NextResponse.next()
    }

    // 3. Protected dashboard routes
    if (pathname.startsWith('/dashboard')) {
        if (!authenticated) {
            // Save the attempted URL for redirect after login
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }
        return NextResponse.next()
    }

    // 4. All other routes are public
    return NextResponse.next()
}

export const config = {
    matcher: [
        '/login',
        '/dashboard/:path*',
        '/api/protected/:path*',
    ]
}
