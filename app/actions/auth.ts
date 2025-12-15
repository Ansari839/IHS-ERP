'use server'

/**
 * Authentication Server Actions
 * 
 * Server-side actions for authentication flow.
 * Better type safety and no HTTP serialization overhead.
 */

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { login, logout as logoutService } from '@/controllers/authController'

/**
 * Login Action
 * Handles user login with form data
 */
export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    console.log('🔐 Login attempt:', { email, passwordLength: password?.length })

    if (!email || !password) {
        console.error('❌ Missing credentials')
        return {
            success: false,
            error: 'Email and password are required',
        }
    }

    const result = await login(email, password)

    console.log('📊 Login result:', {
        success: result.success,
        error: result.success ? undefined : result.error,
        hasData: result.success ? !!result.data : false
    })

    if (!result.success) {
        return {
            success: false,
            error: result.error || 'Login failed',
            validationErrors: result.validationErrors,
        }
    }

    // Handle password change requirement
    if (result.data.requirePasswordChange) {
        const cookieStore = await cookies()

        cookieStore.set('tempToken', result.data.tempToken!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 10, // 10 minutes
            path: '/',
        })

        return redirect('/change-password')
    }

    // Set httpOnly cookies for secure token storage
    const cookieStore = await cookies()

    cookieStore.set('accessToken', result.data.accessToken!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 15, // 15 minutes
        path: '/',
    })

    cookieStore.set('refreshToken', result.data.refreshToken!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    })

    console.log('✅ Login successful, redirecting to dashboard')

    // Redirect to dashboard after successful login
    // Note: This throws NEXT_REDIRECT internally, which is normal!
    redirect('/dashboard')
}

/**
 * Change Password Action
 */
export async function changePasswordAction(formData: FormData) {
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!newPassword || !confirmPassword) {
        return { success: false, error: 'All fields are required' }
    }

    if (newPassword !== confirmPassword) {
        return { success: false, error: 'Passwords do not match' }
    }

    const cookieStore = await cookies()
    const tempToken = cookieStore.get('tempToken')?.value

    if (!tempToken) {
        return { success: false, error: 'Session expired. Please login again.' }
    }

    // Dynamic import to avoid circular dependency if any (though controller is safe)
    const { changePassword } = await import('@/controllers/authController')

    const result = await changePassword(tempToken, newPassword)

    if (!result.success) {
        return { success: false, error: result.error }
    }

    // Clear temp token and set new tokens
    cookieStore.delete('tempToken')

    cookieStore.set('accessToken', result.data.accessToken!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 15,
        path: '/',
    })

    cookieStore.set('refreshToken', result.data.refreshToken!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    })

    redirect('/dashboard')
}

/**
 * Logout Action
 * Handles user logout and cookie clearing
 */
export async function logoutAction() {
    const cookieStore = await cookies()

    // Get refresh token before deleting
    const refreshToken = cookieStore.get('refreshToken')?.value

    // Call logout service if refresh token exists
    if (refreshToken) {
        await logoutService(refreshToken)
    }

    // Delete cookies
    cookieStore.delete('accessToken')
    cookieStore.delete('refreshToken')
    cookieStore.delete('tempToken')

    // Redirect to home
    redirect('/')
}

/**
 * Login with credentials (for API compatibility)
 */
export async function loginWithCredentials(email: string, password: string) {
    const result = await login(email, password)

    if (!result.success) {
        return {
            success: false,
            error: result.error,
            validationErrors: result.validationErrors,
        }
    }

    if (result.data.requirePasswordChange) {
        return {
            success: true,
            data: result.data, // Contains tempToken and requirePasswordChange flag
        }
    }

    // Set cookies
    const cookieStore = await cookies()

    cookieStore.set('accessToken', result.data.accessToken!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 15,
        path: '/',
    })

    cookieStore.set('refreshToken', result.data.refreshToken!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    })

    return {
        success: true,
        data: result.data,
    }
}
