'use client'

/**
 * Login Page - Textile ERP Theme
 * 
 * Premium split-screen layout with industrial/textile aesthetics.
 */

import { useState, useTransition } from 'react'
import { loginAction } from '@/app/actions/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, Factory } from 'lucide-react'

export default function LoginPage() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string>('')
    const [showPassword, setShowPassword] = useState(false)

    async function handleSubmit(formData: FormData) {
        setError('')

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        if (!email || !password) {
            setError('Please fill in all fields')
            return
        }

        startTransition(async () => {
            try {
                const result = await loginAction(formData)
                if (result && !result.success) {
                    setError(result.error || 'Login failed. Please try again.')
                }
            } catch (err) {
                setError('An unexpected error occurred. Please try again.')
            }
        })
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden">

            {/* Left Side - Brand & Visuals */}
            <div className="hidden lg:flex flex-col justify-between relative bg-zinc-900 text-white p-12 overflow-hidden">
                {/* Background Pattern - Fabric Simulation */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                </div>

                {/* Brand Header */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-lg">
                        <Factory className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">IHS Textile ERP</span>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 space-y-6 max-w-lg">
                    <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
                        Weaving Technology <br />
                        <span className="text-primary">Into Excellence.</span>
                    </h1>
                    <p className="text-lg text-zinc-400">
                        Manage your entire textile production line, from raw cotton to finished fabric, with precision and efficiency.
                    </p>
                </div>

                {/* Footer */}
                <div className="relative z-10 flex items-center gap-6 text-sm text-zinc-500 font-medium">
                    <span>© 2026 IHS Textile</span>
                    <span>v2.4.0 (Production)</span>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center p-8 bg-background relative">
                {/* Mobile Background Pattern */}
                <div className="absolute inset-0 lg:hidden pointer-events-none">
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                </div>

                <div className="w-full max-w-[400px] space-y-8 animate-in slide-in-from-right-8 duration-500">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
                        <p className="text-muted-foreground">Sign in to your production workspace</p>
                    </div>

                    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
                        <CardContent className="pt-6">
                            <form action={handleSubmit} className="space-y-4">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium leading-none ml-1">
                                        Work Email
                                    </label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="username"
                                            placeholder="admin@erp.com"
                                            disabled={isPending}
                                            className="flex h-11 w-full rounded-lg border border-input bg-background/50 px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password" className="text-sm font-medium leading-none ml-1">
                                            Password
                                        </label>
                                        <a href="#" className="text-xs font-medium text-primary hover:underline">Forgot password?</a>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            disabled={isPending}
                                            className="flex h-11 w-full rounded-lg border border-input bg-background/50 px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10 transition-all"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Save Credentials Checkbox */}
                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox id="saveCredentials" name="saveCredentials" />
                                    <label
                                        htmlFor="saveCredentials"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none cursor-pointer"
                                    >
                                        Keep me signed in
                                    </label>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 animate-in fade-in-50">
                                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="inline-flex items-center justify-center rounded-lg text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-4 py-2 w-full shadow-lg shadow-primary/20 hover:shadow-primary/40 mt-2"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Authenticating...
                                        </>
                                    ) : (
                                        'Access Workspace'
                                    )}
                                </button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            Restricted Access • Authorized Personnel Only
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
