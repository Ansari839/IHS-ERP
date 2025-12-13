'use client'

/**
 * Logout Button Component
 * 
 * Triggers logout server action and handles UI state.
 */

import { useState } from 'react'
import { logoutAction } from '@/app/actions/auth'
import { LogOut, Loader2 } from 'lucide-react'

export function LogoutButton() {
    const [isLoading, setIsLoading] = useState(false)

    async function handleLogout() {
        setIsLoading(true)
        try {
            await logoutAction()
            // The logoutAction will redirect, so we won't reach here
        } catch (error) {
            console.error('Logout error:', error)
            setIsLoading(false)

            // Show error to user (you can replace with toast notification)
            alert('Failed to logout. Please try again.')
        }
    }

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
            title="Logout"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <LogOut className="h-4 w-4" />
            )}
            <span>Logout</span>
        </button>
    )
}
