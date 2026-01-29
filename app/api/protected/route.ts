/**
 * GET /api/protected
 * 
 * Example protected route.
 * Authentication is handled by edge middleware in /middleware.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { success } from '@/lib/response';
import { withErrorHandler } from '@/middleware/errorHandler';

// export const runtime = 'edge';

async function handleProtected(req: NextRequest) {
    // Extract token from Authorization header
    // Middleware has already verified the token exists and is valid
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        // This shouldn't happen since middleware blocks unauthorized requests
        return NextResponse.json(
            { success: false, error: { message: 'Unauthorized' } },
            { status: 401 }
        );
    }

    // Decode token to get user info
    const decoded = verifyAccessToken(token);

    return success({
        message: 'This is protected data',
        user: {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
        },
        timestamp: new Date().toISOString(),
    });
}

export const GET = withErrorHandler(handleProtected);
