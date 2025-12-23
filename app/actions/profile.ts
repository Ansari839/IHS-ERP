'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { validateEmail } from '@/lib/validation'
import { getCurrentUser } from '@/lib/auth'

export async function updateProfile(formData: FormData) {
    const user = await getCurrentUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const imageFile = formData.get('image') as File | null

    // Validation
    if (!name || !email) {
        return { success: false, error: 'Name and Email are required' }
    }

    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
        return { success: false, error: emailValidation.error }
    }

    try {
        // Check if email is taken by another user
        const existingUser = await prisma.user.findFirst({
            where: {
                email,
                id: { not: user.id }
            },
        })

        if (existingUser) {
            return { success: false, error: 'Email is already in use by another user' }
        }

        let imageUrl: string | undefined = undefined;
        if (imageFile && imageFile.size > 0) {
            try {
                // Determine folder based on environment (optional, but good practice)
                // We'll stick to 'erp-profiles' as defined in utility default for now
                const { uploadToCloudinary } = await import('@/lib/cloudinary');
                imageUrl = await uploadToCloudinary(imageFile);
            } catch (uploadError) {
                console.error("Image upload failed:", uploadError);
                return { success: false, error: 'Failed to upload profile image' };
            }
        }

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                name,
                email,
                ...(imageUrl && { image: imageUrl })
            }
        })

        // Refresh the session to update the token with new user data
        const cookieStore = await cookies()
        const refreshToken = cookieStore.get('refreshToken')?.value

        if (refreshToken) {
            const { refresh } = await import('@/controllers/authController')
            const refreshResult = await refresh(refreshToken)

            if (refreshResult.success && refreshResult.data.accessToken) {
                // Determine maxAge (defaulting to 15 mins if not imported)
                // We'll try to import TOKEN_CONFIG from constants if possible, 
                // but for safety/speed without checking constants file content deeply, 
                // we'll explicitly use 15 mins as seen in auth.ts
                cookieStore.set('accessToken', refreshResult.data.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 15, // 15 minutes
                    path: '/',
                })
            }
        }

        revalidatePath('/profile')
        // We can't easily revalidate the layout from here without a full refresh, 
        // but the client router.refresh() should handle it.

        return { success: true }
    } catch (error) {
        console.error('Error updating profile:', error)
        return { success: false, error: 'Failed to update profile' }
    }
}

export async function removeProfileImage() {
    const user = await getCurrentUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        // Update user to remove image
        await prisma.user.update({
            where: { id: user.id },
            data: { image: null }
        })

        // Refresh the session to update the token with new user data
        const cookieStore = await cookies()
        const refreshToken = cookieStore.get('refreshToken')?.value

        if (refreshToken) {
            const { refresh } = await import('@/controllers/authController')
            const refreshResult = await refresh(refreshToken)

            if (refreshResult.success && refreshResult.data.accessToken) {
                cookieStore.set('accessToken', refreshResult.data.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 15, // 15 minutes
                    path: '/',
                })
            }
        }

        revalidatePath('/profile')
        return { success: true }
    } catch (error) {
        console.error('Error removing profile image:', error)
        return { success: false, error: 'Failed to remove profile image' }
    }
}
