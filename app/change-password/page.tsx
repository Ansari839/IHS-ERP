'use client'

/**
 * Change Password Page
 * 
 * Forces user to change password on first login.
 */

import { useState, useTransition } from 'react'
import { changePasswordAction } from '@/app/actions/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock, AlertCircle, Loader2, CheckCircle } from 'lucide-react'

export default function ChangePasswordPage() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string>('')

    async function handleSubmit(formData: FormData) {
        setError('')

        const newPassword = formData.get('newPassword') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        startTransition(async () => {
            try {
                const result = await changePasswordAction(formData)
                if (result && !result.success) {
                    setError(result.error || 'Failed to change password')
                }
            } catch (err) {
                setError('An unexpected error occurred')
            }
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
            <Card className="w-full max-w-md shadow-lg border-primary/20">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
                        <Lock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
                    <CardDescription>
                        For security, you must change your password before continuing.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        {/* New Password */}
                        <div className="space-y-2">
                            <label htmlFor="newPassword" className="text-sm font-medium leading-none">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    disabled={isPending}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <CheckCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    disabled={isPending}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating Password...
                                </>
                            ) : (
                                'Update Password & Login'
                            )}
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
