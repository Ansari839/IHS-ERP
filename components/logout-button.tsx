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
        } catch (error) {
            console.error('Logout error:', error)
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
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
