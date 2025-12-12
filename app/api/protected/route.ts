/**
 * GET /api/protected
 * 
 * Example protected route demonstrating middleware usage.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/middleware/authenticate';
import { success } from '@/lib/response';
import { withErrorHandler } from '@/middleware/errorHandler';

async function handleProtected(req: NextRequest) {
    // Authenticate user
    const authResult = await authenticate(req);

    if (!authResult.authenticated) {
        return NextResponse.json(authResult.error, { status: 401 });
    }

    // User is authenticated
    const user = authResult.user;

    return success({
        message: 'This is protected data',
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        timestamp: new Date().toISOString(),
    });
}

export const GET = withErrorHandler(handleProtected);
