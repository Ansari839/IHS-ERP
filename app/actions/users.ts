'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { validateEmail, validatePassword } from '@/lib/validation'

import { verifyPermission } from '@/lib/auth-checks'

export async function createUser(formData: FormData) {
    // Verify permission
    try {
        await verifyPermission('create:users')
    } catch (error) {
        return { success: false, error: 'Unauthorized: Missing create:users permission' }
    }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Get all selected roles
    const roleIds = formData.getAll('roles').map(id => parseInt(id as string))

    // Validation
    if (!name || !email || !password) {
        return { success: false, error: 'All fields are required' }
    }

    if (roleIds.length === 0) {
        return { success: false, error: 'At least one role is required' }
    }

    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
        return { success: false, error: emailValidation.error }
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.error }
    }

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return { success: false, error: 'User with this email already exists' }
        }

        // Verify roles exist
        const rolesCount = await prisma.role.count({
            where: { id: { in: roleIds } }
        })

        if (rolesCount !== roleIds.length) {
            return { success: false, error: 'One or more selected roles are invalid' }
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Create user and assign roles
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                firstLogin: true,
                forcePasswordChange: true,
                userRoles: {
                    create: roleIds.map(roleId => ({
                        roleId
                    }))
                }
            },
        })

        revalidatePath('/users')
    } catch (error) {
        console.error('Error creating user:', error)
        return { success: false, error: 'Failed to create user' }
    }

    redirect('/users')
}
