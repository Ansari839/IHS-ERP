import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Shield, Users } from 'lucide-react'
import { Protect } from '@/components/protect'
import { ThemeSettings } from '@/components/settings/theme-settings'

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <div className="grid gap-6">
                {/* Theme Settings */}
                <ThemeSettings />

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Roles & Permissions */}
                    <Protect permission="read:settings">
                        <Link href="/settings/roles">
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-6 w-6 text-primary" />
                                        <CardTitle>Roles & Permissions</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Manage user roles, access levels, and permission settings.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    </Protect>

                    {/* Profile Settings (Placeholder - linked to profile page now) */}
                    <Link href="/profile">
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Users className="h-6 w-6 text-primary" />
                                    <CardTitle>Profile</CardTitle>
                                </div>
                                <CardDescription>
                                    Manage your account details and password.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    )
}
