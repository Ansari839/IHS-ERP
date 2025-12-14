import { cookies } from 'next/headers'
import { verifyAccessToken } from '@/lib/jwt'
import { TokenPayload } from '@/types/auth.types'

export async function getCurrentUser(): Promise<TokenPayload | null> {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    if (!accessToken) {
        return null
    }

    try {
        const decoded = verifyAccessToken(accessToken)
        return decoded
    } catch (error) {
        return null
    }
}
