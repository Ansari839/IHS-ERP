'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
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

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: { name, email }
        })

        revalidatePath('/profile')
        // We can't easily revalidate the layout from here without a full refresh, 
        // but the client router.refresh() should handle it.

        return { success: true }
    } catch (error) {
        console.error('Error updating profile:', error)
        return { success: false, error: 'Failed to update profile' }
    }
}
