/**
 * Root Middleware - Authentication
 * 
 * Runs before route handlers load.
 * Protects API routes and dashboard pages.
 * Handles smart redirects based on auth state.
 * 
 * Note: Uses Node.js runtime for JWT verification (requires crypto module)
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'



/**
 * Check if user is authenticated
 */
function isAuthenticated(request: NextRequest): boolean {
    const accessToken = request.cookies.get('accessToken')?.value

    console.log('🔍 Middleware auth check:', {
        path: request.nextUrl.pathname,
        hasCookie: !!accessToken,
        cookiePreview: accessToken ? accessToken.substring(0, 20) + '...' : 'none'
    })

    if (!accessToken) {
        console.log('❌ No access token found')
        return false
    }

    try {
        verifyAccessToken(accessToken)
        console.log('✅ Token verified successfully')
        return true
    } catch (error) {
        console.log('❌ Token verification failed:', error instanceof Error ? error.message : 'unknown')
        return false
    }
}

export function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    const authenticated = isAuthenticated(request)

    console.log(`🌐 Middleware: ${pathname} | Auth: ${authenticated}`)

    // 1. Handle login page
    if (pathname === '/login') {
        if (authenticated) {
            console.log('↩️  Already authenticated, redirecting to dashboard')
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        // Check for tempToken (password change required)
        const tempToken = request.cookies.get('tempToken')?.value
        if (tempToken) {
            console.log('↩️  Password change required, redirecting to change-password')
            return NextResponse.redirect(new URL('/change-password', request.url))
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
            // Check if they have a temp token
            const tempToken = request.cookies.get('tempToken')?.value
            if (tempToken) {
                console.log('↩️  Password change required, redirecting to change-password')
                return NextResponse.redirect(new URL('/change-password', request.url))
            }

            console.log('🚫 Not authenticated, redirecting to login')
            // Save the attempted URL for redirect after login
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }
        console.log('✅ Authenticated, allowing access to dashboard')
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
