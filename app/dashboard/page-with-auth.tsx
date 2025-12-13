import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAccessToken } from '@/lib/jwt'

/**
 * Dashboard Page - Protected Route
 * 
 * Checks authentication before rendering.
 */
export default async function DashboardPage() {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    // Check if user is authenticated
    if (!accessToken) {
        redirect('/login?redirect=/dashboard')
    }

    try {
        verifyAccessToken(accessToken)
    } catch {
        redirect('/login?redirect=/dashboard')
    }

    // User is authenticated, import and render the actual dashboard
    const { default: Dashboard } = await import('./dashboard-content')
    return <Dashboard />
}
