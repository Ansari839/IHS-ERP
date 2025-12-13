import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAccessToken } from '@/lib/jwt'

/**
 * Root Entry Point
 * 
 * Redirects based on authentication state:
 * - Authenticated → /dashboard
 * - Not authenticated → /login
 */
export default async function Home() {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    // Check if user is authenticated
    if (accessToken) {
        try {
            verifyAccessToken(accessToken)
            // Valid token, redirect to dashboard
            redirect('/dashboard')
        } catch {
            // Invalid token, redirect to login
            redirect('/login')
        }
    }

    // No token, redirect to login
    redirect('/login')
}
