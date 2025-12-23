'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { updateProfile } from '@/app/actions/profile'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

interface ProfileFormProps {
    user: {
        name: string | null
        email: string
        image?: string | null
    }
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [preview, setPreview] = useState<string | null>(user.image || null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const objectUrl = URL.createObjectURL(file)
            setPreview(objectUrl)
        }
    }

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const result = await updateProfile(formData)

            if (result.success) {
                toast.success('Profile updated successfully')
                router.refresh() // Refresh to update navbar
            } else {
                toast.error(result.error || 'Failed to update profile')
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>
                    Update your personal information.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative h-24 w-24">
                            <div className="h-24 w-24 rounded-full overflow-hidden bg-muted border-2 border-muted">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Profile preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground text-2xl font-bold bg-secondary">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="image" className="cursor-pointer text-sm font-medium text-primary hover:underline">
                                Change Picture
                            </Label>
                            <Input
                                id="image"
                                name="image"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                                disabled={isPending}
                            />
                            {preview && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setPreview(null);
                                        const { removeProfileImage } = await import('@/app/actions/profile');
                                        startTransition(async () => {
                                            const result = await removeProfileImage();
                                            if (result.success) {
                                                toast.success('Profile picture removed');
                                                router.refresh();
                                            } else {
                                                toast.error('Failed to remove picture');
                                                setPreview(user.image || null);
                                            }
                                        });
                                    }}
                                    className="text-sm font-medium text-destructive hover:underline"
                                    disabled={isPending}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={user.name || ''}
                            placeholder="John Doe"
                            required
                            disabled={isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={user.email}
                            placeholder="john@example.com"
                            required
                            disabled={isPending}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent >
        </Card >
    )
}
