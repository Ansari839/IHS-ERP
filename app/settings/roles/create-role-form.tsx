'use client'

import { useState } from 'react'
import { createRole } from '@/app/actions/roles'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'

export function CreateRoleForm() {
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setError(null)

        try {
            const result = await createRole(formData)
            if (result && !result.success) {
                setError(result.error)
                setIsLoading(false)
            }
            // On success, the server action redirects, so we don't need to reset loading state
            // as the page will navigate away.
        } catch (e) {
            setError('An unexpected error occurred')
            setIsLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                    Role Name
                </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="e.g. Inventory Manager"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                    disabled={isLoading}
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                    Description
                </label>
                <input
                    type="text"
                    name="description"
                    id="description"
                    placeholder="Role description"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                />
            </div>

            {error && (
                <div className="text-sm text-red-500 font-medium">
                    {error}
                </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Plus className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Creating...' : 'Create Role'}
            </Button>
        </form>
    )
}
